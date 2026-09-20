// Pas de "server-only" ici : ce module est importé à la fois par des routes
// Node (via auth.ts) et par proxy.ts, qui tourne dans le runtime Edge. jose
// est compatible avec les deux car il repose sur l'API Web Crypto standard.
import { SignJWT, jwtVerify } from "jose";

const secretValue = process.env.SESSION_SECRET;
if (!secretValue) {
  throw new Error(
    "SESSION_SECRET manquant. Générez une valeur aléatoire (ex: `openssl rand -base64 32`) et " +
      "ajoutez-la dans .env.local en local, et dans les variables d'environnement du service en production.",
  );
}
const secret = new TextEncoder().encode(secretValue);

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
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
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
