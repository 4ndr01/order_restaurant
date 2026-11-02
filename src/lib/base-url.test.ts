import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  CANONICAL_SITE_ORIGIN,
  LEGACY_RENDER_HOST,
  canonicalHostRedirectUrl,
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

describe("redirection http et www vers la canonique", () => {
  it("renvoie http://wegood.kim vers https://wegood.kim en conservant chemin et query", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    restore("NODE_ENV", "production");
    const target = canonicalHostRedirectUrl(
      headers({ host: "wegood.kim", "x-forwarded-proto": "http" }),
      "/tarif",
      "?offre=essai",
      "GET",
    );
    assert.equal(target?.href, `${CANONICAL_SITE_ORIGIN}/tarif?offre=essai`);
  });

  it("renvoie www, en http comme en https, vers l'apex https", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    restore("NODE_ENV", "production");
    const httpWww = canonicalHostRedirectUrl(
      headers({ "x-forwarded-host": "www.wegood.kim", "x-forwarded-proto": "http" }),
      "/",
      "",
      "HEAD",
    );
    const httpsWww = canonicalHostRedirectUrl(
      headers({ host: "www.wegood.kim:443", "x-forwarded-proto": "https" }),
      "/signup",
      "",
      "GET",
    );
    assert.equal(httpWww?.href, `${CANONICAL_SITE_ORIGIN}/`);
    assert.equal(httpsWww?.href, `${CANONICAL_SITE_ORIGIN}/signup`);
  });

  it("ne redirige pas l'apex déjà en https, même si une valeur suivante dit http", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    restore("NODE_ENV", "production");
    assert.equal(
      canonicalHostRedirectUrl(
        headers({ host: "wegood.kim", "x-forwarded-proto": "https,http" }),
        "/",
        "",
        "GET",
      ),
      null,
    );
    assert.equal(
      canonicalHostRedirectUrl(
        headers({ host: "wegood.kim", "x-forwarded-proto": "https" }),
        "/",
        "",
        "GET",
      ),
      null,
    );
  });

  it("prend la première valeur quand le client est en http", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    restore("NODE_ENV", "production");
    const target = canonicalHostRedirectUrl(
      headers({ host: "wegood.kim", "x-forwarded-proto": "http, https" }),
      "/",
      "",
      "GET",
    );
    assert.equal(target?.href, `${CANONICAL_SITE_ORIGIN}/`);
  });

  it("ne redirige pas sans schéma explicite, ni les API, ni les écritures", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    restore("NODE_ENV", "production");
    const apex = headers({ host: "wegood.kim" });
    const httpApex = headers({ host: "wegood.kim", "x-forwarded-proto": "http" });
    assert.equal(canonicalHostRedirectUrl(apex, "/", "", "GET"), null);
    assert.equal(canonicalHostRedirectUrl(httpApex, "/api/health", "", "GET"), null);
    assert.equal(canonicalHostRedirectUrl(httpApex, "/api/stripe/webhook", "", "POST"), null);
    assert.equal(canonicalHostRedirectUrl(httpApex, "/api/stripe/webhook", "", "GET"), null);
    assert.equal(canonicalHostRedirectUrl(httpApex, "/login", "", "POST"), null);
  });

  it("ne redirige pas le développement, localhost, ni un hôte onrender.com", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    restore("NODE_ENV", "development");
    assert.equal(
      canonicalHostRedirectUrl(
        headers({ host: "wegood.kim", "x-forwarded-proto": "http" }),
        "/",
        "",
        "GET",
      ),
      null,
    );

    restore("NODE_ENV", "production");
    assert.equal(
      canonicalHostRedirectUrl(
        headers({ host: "localhost:3000", "x-forwarded-proto": "http" }),
        "/",
        "",
        "GET",
      ),
      null,
    );
    assert.equal(
      canonicalHostRedirectUrl(
        headers({ host: "order-restaurant-1.onrender.com", "x-forwarded-proto": "http" }),
        "/",
        "",
        "GET",
      ),
      null,
    );
    assert.equal(
      canonicalHostRedirectUrl(
        headers({ host: "autre.onrender.com", "x-forwarded-proto": "https" }),
        "/",
        "",
        "GET",
      ),
      null,
    );
  });

  it("suit NEXT_PUBLIC_BASE_URL quand il définit une autre origine https", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://exemple.test/";
    restore("NODE_ENV", "production");
    const target = canonicalHostRedirectUrl(
      headers({ host: "www.exemple.test", "x-forwarded-proto": "http" }),
      "/tarif",
      "",
      "GET",
    );
    assert.equal(target?.href, "https://exemple.test/tarif");
    assert.equal(
      canonicalHostRedirectUrl(
        headers({ host: "wegood.kim", "x-forwarded-proto": "http" }),
        "/",
        "",
        "GET",
      ),
      null,
    );
  });

  it("ne redirige pas si l'origine configurée n'est pas en https", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "http://wegood.kim";
    restore("NODE_ENV", "production");
    assert.equal(
      canonicalHostRedirectUrl(
        headers({ host: "wegood.kim", "x-forwarded-proto": "http" }),
        "/",
        "",
        "GET",
      ),
      null,
    );
  });
});
