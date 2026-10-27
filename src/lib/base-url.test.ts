import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  CANONICAL_SITE_ORIGIN,
  LEGACY_RENDER_HOST,
  configuredSiteUrl,
  legacyHostRedirectUrl,
  publicSiteUrl,
  resolveBaseUrl,
} from "./base-url";

const ORIGINAL_BASE = process.env.NEXT_PUBLIC_BASE_URL;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

afterEach(() => {
  restore("NEXT_PUBLIC_BASE_URL", ORIGINAL_BASE);
  restore("NODE_ENV", ORIGINAL_NODE_ENV);
});

function restore(name: "NEXT_PUBLIC_BASE_URL" | "NODE_ENV", value: string | undefined) {
  const env = process.env as Record<string, string | undefined>;
  if (value === undefined) delete env[name];
  else env[name] = value;
}

function headers(values: Record<string, string>): Headers {
  return new Headers(values);
}

describe("adresse publique", () => {
  it("utilise https://wegood.kim quand aucune variable n'est définie", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    assert.equal(configuredSiteUrl(), null);
    assert.equal(publicSiteUrl().origin, CANONICAL_SITE_ORIGIN);
  });

  it("laisse NEXT_PUBLIC_BASE_URL primer, sans barre finale", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://exemple.test/";
    assert.equal(configuredSiteUrl(), "https://exemple.test");
    assert.equal(publicSiteUrl().origin, "https://exemple.test");
  });

  it("ignore une valeur illisible", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "pas une url";
    assert.equal(configuredSiteUrl(), null);
    assert.equal(publicSiteUrl().origin, CANONICAL_SITE_ORIGIN);
  });
});

describe("resolveBaseUrl", () => {
  it("en production, ignore l'hôte entrant et localhost", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    restore("NODE_ENV", "production");
    const resolved = resolveBaseUrl(
      headers({ host: LEGACY_RENDER_HOST, "x-forwarded-proto": "https" }),
      null,
      "http://localhost:3000",
    );
    assert.equal(resolved, CANONICAL_SITE_ORIGIN);
  });

  it("en développement, reprend l'hôte de la requête", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    restore("NODE_ENV", "development");
    const resolved = resolveBaseUrl(
      headers({ "x-forwarded-host": "192.168.1.20:3000", "x-forwarded-proto": "http" }),
    );
    assert.equal(resolved, "http://192.168.1.20:3000");
  });

  it("un paramètre explicite gagne sur la production", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    restore("NODE_ENV", "production");
    assert.equal(
      resolveBaseUrl(headers({ host: "localhost:3000" }), "https://autre.test/chemin"),
      "https://autre.test",
    );
  });
});

describe("redirection de l'ancien hôte", () => {
  it("renvoie les pages GET vers https://wegood.kim en conservant le chemin", () => {
    const target = legacyHostRedirectUrl(
      headers({ "x-forwarded-host": `${LEGACY_RENDER_HOST}:443` }),
      "/r/chez-kim/table/12",
      "?source=qr",
      "GET",
    );
    assert.equal(target?.href, `${CANONICAL_SITE_ORIGIN}/r/chez-kim/table/12?source=qr`);
  });

  it("ne redirige pas le webhook Stripe, la santé, ni les autres routes d'API", () => {
    const legacy = headers({ host: LEGACY_RENDER_HOST });
    assert.equal(legacyHostRedirectUrl(legacy, "/api/stripe/webhook", "", "POST"), null);
    assert.equal(legacyHostRedirectUrl(legacy, "/api/stripe/webhook", "", "GET"), null);
    assert.equal(legacyHostRedirectUrl(legacy, "/api/health", "", "GET"), null);
    assert.equal(legacyHostRedirectUrl(legacy, "/api/r/chez-kim/orders", "", "POST"), null);
  });

  it("ne redirige pas les POST de pages ni l'hôte canonique", () => {
    const legacy = headers({ host: LEGACY_RENDER_HOST });
    assert.equal(legacyHostRedirectUrl(legacy, "/login", "", "POST"), null);
    assert.equal(
      legacyHostRedirectUrl(headers({ host: "wegood.kim" }), "/", "", "GET"),
      null,
    );
  });
});
