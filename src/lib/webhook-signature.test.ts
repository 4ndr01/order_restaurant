import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Stripe from "stripe";
import { collectWebhookSecrets, constructEventWithSecrets } from "./webhook-signature";

const CONNECT = "whsec_connect";
const PLATFORM = "whsec_platform";

function signed(secret: string, id = "evt_test"): { payload: string; header: string } {
  const payload = JSON.stringify({ id, object: "event", type: "customer.subscription.updated" });
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  return { payload, header };
}

describe("secrets de webhook", () => {
  it("ignore les valeurs vides et les doublons, en gardant l'ordre", () => {
    assert.deepEqual(collectWebhookSecrets(` ${CONNECT} `, "", undefined, CONNECT, ` ${PLATFORM} `), [
      CONNECT,
      PLATFORM,
    ]);
  });

  it("accepte un message signé par le second secret", () => {
    const { payload, header } = signed(PLATFORM, "evt_platform");
    const event = constructEventWithSecrets(payload, header, [CONNECT, PLATFORM]);
    assert.equal(event?.id, "evt_platform");
  });

  it("accepte un message signé par le secret Connect seul", () => {
    const { payload, header } = signed(CONNECT, "evt_connect");
    const event = constructEventWithSecrets(payload, header, [CONNECT]);
    assert.equal(event?.id, "evt_connect");
  });

  it("refuse quand aucun secret ne correspond", () => {
    const { payload, header } = signed("whsec_autre");
    assert.equal(constructEventWithSecrets(payload, header, [CONNECT, PLATFORM]), null);
    assert.equal(constructEventWithSecrets(payload, header, []), null);
  });
});
