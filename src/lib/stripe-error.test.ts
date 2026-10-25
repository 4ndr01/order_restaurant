import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  accountCreationIdempotencyAction,
  describeStripeError,
  isIdempotentReplay,
} from "./stripe-error";

const PLATFORM_PROFILE =
  "You must complete your platform profile to use Connect and create live connected accounts.";

describe("création de compte Stripe : clé d'idempotence", () => {
  it("oublie une erreur 400, même rejouée, pour qu'un nouvel essai parte vraiment", () => {
    const error = {
      type: "StripeInvalidRequestError",
      rawType: "invalid_request_error",
      statusCode: 400,
      message: PLATFORM_PROFILE,
      headers: { "idempotent-replayed": "true" },
    };
    assert.equal(isIdempotentReplay(error), true);
    assert.equal(accountCreationIdempotencyAction(error), "forget");
  });

  it("oublie aussi une 400 fraîche : la clé est déjà empoisonnée côté Stripe", () => {
    assert.equal(
      accountCreationIdempotencyAction({
        type: "StripeInvalidRequestError",
        statusCode: 400,
        message: PLATFORM_PROFILE,
      }),
      "forget",
    );
  });

  it("attend quand une autre requête utilise encore la même clé", () => {
    assert.equal(
      accountCreationIdempotencyAction({
        type: "StripeAPIError",
        statusCode: 409,
        message:
          "There is currently another in-progress request using this Idempotency Key (that probably means you submitted twice).",
      }),
      "wait",
    );
    assert.equal(
      accountCreationIdempotencyAction({ type: "StripeAPIError", statusCode: 409, message: "" }),
      "wait",
    );
  });

  it("garde la clé si le réseau a coupé avant une réponse", () => {
    assert.equal(
      accountCreationIdempotencyAction({
        type: "StripeConnectionError",
        message: "An error occurred with our connection to Stripe.",
      }),
      "keep",
    );
    assert.equal(isIdempotentReplay({ type: "StripeConnectionError" }), false);
  });

  it("garde la clé sur un 500 non rejoué, et l'oublie une fois la réponse rejouée", () => {
    assert.equal(
      accountCreationIdempotencyAction({
        type: "StripeAPIError",
        statusCode: 500,
        message: "An unknown error occurred",
      }),
      "keep",
    );
    assert.equal(
      accountCreationIdempotencyAction({
        type: "StripeAPIError",
        statusCode: 500,
        message: "An unknown error occurred",
        headers: { "idempotent-replayed": ["true"] },
      }),
      "forget",
    );
  });
});

describe("message montré à l'admin", () => {
  it("affiche le message Stripe d'un refus de création de compte", () => {
    const text = describeStripeError({
      type: "StripeInvalidRequestError",
      rawType: "invalid_request_error",
      statusCode: 400,
      message: PLATFORM_PROFILE,
      raw: { message: PLATFORM_PROFILE },
    });
    assert.equal(text, `Stripe a refusé la demande : ${PLATFORM_PROFILE}`);
  });

  it("n'efface pas le message d'une erreur API (409, 500)", () => {
    const message =
      "There is currently another in-progress request using this Idempotency Key";
    assert.equal(
      describeStripeError({ type: "StripeAPIError", statusCode: 409, message }),
      `Stripe a refusé la demande : ${message}`,
    );
  });

  it("ne remplace pas une erreur interne par un texte Stripe", () => {
    assert.equal(
      describeStripeError(new Error("Restaurant introuvable.")),
      "Une erreur inattendue est survenue avec Stripe. Réessayez dans un instant.",
    );
  });
});
