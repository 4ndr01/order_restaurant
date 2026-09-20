// Pas de "server-only" ici : ce module est importé à la fois par des routes
// Node (via auth.ts) et par proxy.ts, qui tourne dans le runtime Edge. jose
// est compatible avec les deux car il repose sur l'API Web Crypto standard.
import { SignJWT, jwtVerify } from "jose";

// Résolu à la première utilisation, pas au chargement du module : sinon,
// l'étape "collect page data" de `next build` évalue le module de chaque
// route dynamique et ferait échouer toute la construction si la variable
// n'est pas encore définie, alors qu'aucune requête n'a encore eu lieu.
let cachedSecret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (!cachedSecret) {
    const secretValue = process.env.SESSION_SECRET;
    if (!secretValue) {
      throw new Error(
        "SESSION_SECRET manquant. Générez une valeur aléatoire (ex: `openssl rand -base64 32`) et " +
          "ajoutez-la dans .env.local en local, et dans les variables d'environnement du service en production.",
      );
    }
    cachedSecret = new TextEncoder().encode(secretValue);
  }
  return cachedSecret;
}

export const SESSION_COOKIE = "session";
const SESSION_DURATION = "30d";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionPayload = {
  restaurantId: string;
  ownerId: string;
  slug: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.restaurantId === "string" &&
      typeof payload.ownerId === "string" &&
      typeof payload.slug === "string"
    ) {
      return { restaurantId: payload.restaurantId, ownerId: payload.ownerId, slug: payload.slug };
    }
    return null;
  } catch {
    return null;
  }
}
