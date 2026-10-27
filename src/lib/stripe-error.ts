/**
 * Lecture des erreurs Stripe et décision sur la clé d'idempotence, sans
 * dépendre du client Stripe : testable, et utilisable au moment où l'on
 * décide s'il faut retenter la création d'un compte.
 */

export type AccountCreationIdempotencyAction = "wait" | "forget" | "keep";

/** Message renvoyé par Stripe, qu'il soit sur l'erreur ou dans le corps brut. */
export function stripeErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const raw = (error as { raw?: { message?: unknown } }).raw?.message;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  const message = (error as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) return message.trim();
  return null;
}

function statusCodeOf(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === "number" ? status : undefined;
}

function headerValue(error: unknown, name: string): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const headers = (error as { headers?: unknown }).headers;
  if (!headers || typeof headers !== "object") return undefined;
  const record = headers as Record<string, unknown>;
  const value = record[name] ?? record[name.toLowerCase()];
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

/** Vrai quand Stripe renvoie la réponse déjà mémorisée pour cette clé. */
export function isIdempotentReplay(error: unknown): boolean {
  return headerValue(error, "idempotent-replayed") === "true";
}

function errorKind(error: unknown): { type?: string; rawType?: string } {
  if (!error || typeof error !== "object") return {};
  const type = (error as { type?: unknown }).type;
  const rawType = (error as { rawType?: unknown }).rawType;
  return {
    type: typeof type === "string" ? type : undefined,
    rawType: typeof rawType === "string" ? rawType : undefined,
  };
}

function isKind(error: unknown, type: string, rawType: string): boolean {
  const kind = errorKind(error);
  return kind.type === type || kind.rawType === rawType;
}

/**
 * 409 : une autre requête avec cette clé est encore en cours (ou entre en
 * conflit avec elle). La clé n'a pas de résultat définitif. Il faut attendre
 * et réessayer avec la même clé — une nouvelle clé ouvrirait un second compte.
 */
function isIdempotencyInProgress(error: unknown): boolean {
  return statusCodeOf(error) === 409;
}

function isConnectionFailure(error: unknown): boolean {
  return isKind(error, "StripeConnectionError", "api_connection_error");
}

/**
 * Un 500 non rejoué laisse le résultat indéterminé : Stripe a pu créer le
 * compte malgré l'erreur. On garde la clé pour que le prochain essai
 * récupère le même résultat au lieu d'en créer un second. Une fois la
 * réponse rejouée, la même clé ne peut plus réussir : on l'oublie.
 */
function isIndeterminateServerError(error: unknown): boolean {
  const status = statusCodeOf(error);
  return typeof status === "number" && status >= 500 && !isIdempotentReplay(error);
}

/**
 * Après un échec de `accounts.create` :
 * - `forget` : Stripe a répondu par une erreur (souvent rejouée 24 h). La clé
 *   ne doit plus servir, sinon le restaurant reste bloqué une fois la cause
 *   corrigée.
 * - `wait` : une autre requête utilise encore cette clé.
 * - `keep` : pas de réponse, ou résultat indéterminé. Réutiliser la clé évite
 *   un second compte.
 */
export function accountCreationIdempotencyAction(
  error: unknown,
): AccountCreationIdempotencyAction {
  if (isIdempotencyInProgress(error)) return "wait";
  if (isConnectionFailure(error)) return "keep";
  if (isIndeterminateServerError(error)) return "keep";
  if (typeof statusCodeOf(error) === "number") return "forget";
  return "keep";
}

/**
 * Traduit une erreur Stripe en message compréhensible. Seule une vraie panne
 * réseau est présentée comme passagère : une erreur de configuration doit
 * montrer le message de Stripe, sinon on la cherche au mauvais endroit.
 */
export function describeStripeError(error: unknown): string {
  const message = stripeErrorMessage(error);

  if (isKind(error, "StripeConnectionError", "api_connection_error")) {
    const detail = (error as { detail?: { message?: unknown } } | null)?.detail?.message;
    const extra = typeof detail === "string" && detail.trim() ? detail.trim() : message;
    return (
      "Connexion à Stripe impossible. Réessayez dans un instant." +
      (extra ? ` (détail : ${extra})` : "")
    );
  }

  if (isKind(error, "StripeAuthenticationError", "authentication_error")) {
    return (
      "La clé Stripe de la plateforme est refusée : vérifiez que STRIPE_SECRET_KEY contient " +
      "bien la clé secrète (sk_test_… ou sk_live_…)." +
      (message ? ` Réponse de Stripe : ${message}` : "")
    );
  }

  if (isKind(error, "StripePermissionError", "permission_error")) {
    return (
      "La clé Stripe de la plateforme n'a pas les droits nécessaires : utilisez la clé " +
      "secrète (sk_…), pas une clé restreinte (rk_…)." +
      (message ? ` Réponse de Stripe : ${message}` : "")
    );
  }

  if (
    isKind(error, "StripeInvalidRequestError", "invalid_request_error") ||
    isKind(error, "StripeIdempotencyError", "idempotency_error") ||
    isKind(error, "StripeAPIError", "api_error") ||
    isKind(error, "StripeRateLimitError", "rate_limit_error")
  ) {
    return message
      ? `Stripe a refusé la demande : ${message}`
      : "Stripe a refusé la demande.";
  }

  const kind = errorKind(error);
  const looksLikeStripe =
    kind.type?.startsWith("Stripe") ||
    typeof kind.rawType === "string" ||
    typeof statusCodeOf(error) === "number";
  if (looksLikeStripe && message) {
    return `Stripe a refusé la demande : ${message}`;
  }

  return "Une erreur inattendue est survenue avec Stripe. Réessayez dans un instant.";
}
