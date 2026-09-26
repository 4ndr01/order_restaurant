import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Accès administrateur de la plateforme (tous les restaurants, en lecture
 * seule). Il est volontairement séparé des comptes restaurant :
 * - les emails autorisés et le mot de passe ne vivent que dans les variables
 *   d'environnement du service, personne ne peut s'inscrire administrateur ;
 * - la session est signée avec une clé dérivée distincte et une audience
 *   propre, donc un jeton de restaurant n'ouvre jamais cet accès (ni
 *   l'inverse) ;
 * - elle est revérifiée à chaque page : retirer l'email de la liste ou
 *   changer le mot de passe coupe immédiatement les sessions ouvertes.
 */

export const PLATFORM_COOKIE = "platform_session";
const AUDIENCE = "we-good-kim-platform-admin";
const SESSION_HOURS = 12;
const MIN_PASSWORD_LENGTH = 13;

function allowedEmails(): string[] {
  return (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function adminPassword(): string {
  return process.env.PLATFORM_ADMIN_PASSWORD?.trim() ?? "";
}

export function isPlatformAdminConfigured(): boolean {
  return allowedEmails().length > 0 && adminPassword().length >= MIN_PASSWORD_LENGTH;
}

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET manquant.");
  }
  return secret;
}

function signingKey(): Uint8Array {
  return createHmac("sha256", sessionSecret()).update("platform-admin-session").digest();
}

/** Empreinte du mot de passe : change si le mot de passe change, sans le révéler. */
function passwordFingerprint(): string {
  return createHmac("sha256", sessionSecret())
    .update(`platform-admin-password:${adminPassword()}`)
    .digest("hex")
    .slice(0, 32);
}

function sameSecret(a: string, b: string): boolean {
  // Comparaison à temps constant sur des empreintes de même longueur.
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

export function checkPlatformCredentials(email: string, password: string): boolean {
  if (!isPlatformAdminConfigured()) {
    return false;
  }
  const emailAllowed = allowedEmails().includes(email.trim().toLowerCase());
  const passwordOk = sameSecret(password, adminPassword());
  return emailAllowed && passwordOk;
}

export async function setPlatformSessionCookie(email: string): Promise<void> {
  const token = await new SignJWT({ email: email.trim().toLowerCase(), pwd: passwordFingerprint() })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(signingKey());
  const store = await cookies();
  store.set(PLATFORM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function clearPlatformSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PLATFORM_COOKIE);
}

/** Email de l'administrateur connecté, ou null. */
export async function getPlatformAdmin(): Promise<string | null> {
  if (!isPlatformAdminConfigured()) {
    return null;
  }
  const store = await cookies();
  const token = store.get(PLATFORM_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, signingKey(), { audience: AUDIENCE });
    if (
      typeof payload.email !== "string" ||
      !allowedEmails().includes(payload.email) ||
      payload.pwd !== passwordFingerprint()
    ) {
      return null;
    }
    return payload.email;
  } catch {
    return null;
  }
}
