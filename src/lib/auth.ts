import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ensureSchema, createId, sql } from "./db";
import { hashPassword, verifyPassword } from "./password";
import { seedRestaurant } from "./seed";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "./session";
import { CURRENT_PLAN } from "./plans";
import { isSlugTaken } from "./repo";
import type { Restaurant } from "./types";

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

/**
 * À utiliser en tête de chaque route API d'administration : l'identité du
 * restaurant vient toujours de la session signée, jamais d'un paramètre
 * fourni par le client, pour qu'un restaurant ne puisse jamais agir sur les
 * données d'un autre.
 */
export async function requireSession(): Promise<
  { session: SessionPayload } | { response: Response }
> {
  const session = await getSession();
  if (!session) {
    return { response: Response.json({ error: "Non authentifié." }, { status: 401 }) };
  }
  return { session };
}

export type SignupInput = {
  restaurantName: string;
  slug: string;
  email: string;
  password: string;
};

export async function signup(
  input: SignupInput,
): Promise<{ restaurant: Restaurant; session: SessionPayload } | { error: string }> {
  await ensureSchema();

  const restaurantName = input.restaurantName.trim().slice(0, 80);
  const slug = input.slug.trim().toLowerCase().slice(0, 60);
  const email = input.email.trim().toLowerCase().slice(0, 120);

  if (!restaurantName) {
    return { error: "Le nom du restaurant est obligatoire." };
  }
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) {
    return { error: "L'adresse doit faire au moins 3 caractères (lettres, chiffres, tirets)." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Adresse email invalide." };
  }
  if (input.password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }
  if (await isSlugTaken(slug)) {
    return { error: "Cette adresse est déjà prise, choisissez-en une autre." };
  }

  const [existingOwner] = await sql`SELECT 1 FROM restaurant_owners WHERE email = ${email}`;
  if (existingOwner) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const restaurantId = createId();
  const ownerId = createId();
  const passwordHash = await hashPassword(input.password);

  await sql`
    INSERT INTO restaurants (id, slug, name, plan, price_cents)
    VALUES (${restaurantId}, ${slug}, ${restaurantName}, ${CURRENT_PLAN.id}, ${CURRENT_PLAN.priceCents})
  `;
  await sql`
    INSERT INTO restaurant_owners (id, restaurant_id, email, password_hash)
    VALUES (${ownerId}, ${restaurantId}, ${email}, ${passwordHash})
  `;
  await seedRestaurant(restaurantId);

  const session: SessionPayload = { restaurantId, ownerId, slug };
  return {
    restaurant: {
      id: restaurantId,
      slug,
      name: restaurantName,
      plan: CURRENT_PLAN.id,
      priceCents: CURRENT_PLAN.priceCents,
    },
    session,
  };
}

export type LoginInput = { email: string; password: string };

export async function login(
  input: LoginInput,
): Promise<{ session: SessionPayload } | { error: string }> {
  await ensureSchema();

  const email = input.email.trim().toLowerCase();
  const rows = await sql<
    { id: string; restaurant_id: string; password_hash: string; slug: string }[]
  >`
    SELECT o.id, o.restaurant_id, o.password_hash, r.slug
    FROM restaurant_owners o
    JOIN restaurants r ON r.id = o.restaurant_id
    WHERE o.email = ${email}
  `;
  const owner = rows[0];
  if (!owner || !(await verifyPassword(input.password, owner.password_hash))) {
    return { error: "Email ou mot de passe incorrect." };
  }

  return {
    session: { restaurantId: owner.restaurant_id, ownerId: owner.id, slug: owner.slug },
  };
}

// ---- Réinitialisation de mot de passe ----

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Crée un jeton de réinitialisation si l'email correspond à un compte.
 * Renvoie `null` quand aucun compte ne correspond : l'appelant doit répondre
 * la même chose dans les deux cas, pour ne pas révéler quels emails sont
 * inscrits.
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  await ensureSchema();

  const normalized = email.trim().toLowerCase();
  const [owner] = await sql<{ id: string }[]>`
    SELECT id FROM restaurant_owners WHERE email = ${normalized}
  `;
  if (!owner) {
    return null;
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await sql`
    INSERT INTO password_resets (token_hash, owner_id, expires_at)
    VALUES (${hashToken(token)}, ${owner.id}, ${expiresAt})
  `;
  return token;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ ok: true } | { error: string }> {
  await ensureSchema();

  if (newPassword.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }

  const [reset] = await sql<{ owner_id: string }[]>`
    SELECT owner_id FROM password_resets
    WHERE token_hash = ${hashToken(token)}
      AND used_at IS NULL
      AND expires_at > now()
  `;
  if (!reset) {
    return { error: "Ce lien de réinitialisation est invalide ou a expiré." };
  }

  const passwordHash = await hashPassword(newPassword);
  await sql.begin(async (tx) => {
    await tx`
      UPDATE restaurant_owners SET password_hash = ${passwordHash} WHERE id = ${reset.owner_id}
    `;
    // Le jeton est consommé, et les autres jetons en attente du même compte
    // sont invalidés : un lien plus ancien resté dans une boîte mail ne doit
    // plus rien permettre.
    await tx`
      UPDATE password_resets SET used_at = now()
      WHERE owner_id = ${reset.owner_id} AND used_at IS NULL
    `;
    return [];
  });

  return { ok: true };
}
