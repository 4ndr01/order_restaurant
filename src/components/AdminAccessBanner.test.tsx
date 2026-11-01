import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AdminAccessBanner from "./AdminAccessBanner";

function html(
  props: { audience: "owner" | "team"; billingLink: boolean },
): string {
  return renderToStaticMarkup(
    createElement(AdminAccessBanner, {
      slug: "chez-kim",
      phase: "blocked",
      audience: props.audience,
      billingLink: props.billingLink,
    }),
  );
}

describe("bandeau commandes en pause", () => {
  it("dit à l'équipe de prévenir le responsable, sans lien", () => {
    const markup = html({ audience: "team", billingLink: true });
    assert.match(markup, /demandez au responsable/);
    assert.equal(markup.includes("href="), false);
    assert.equal(markup.includes("/admin/abonnement"), false);
  });

  it("donne au responsable le lien d'abonnement et rappelle les remboursements", () => {
    const markup = html({ audience: "owner", billingLink: true });
    assert.match(markup, /href="\/r\/chez-kim\/admin\/abonnement"/);
    assert.match(markup, /rembourser/);
    assert.equal(markup.includes("responsable"), false);
  });

  it("n'affiche pas le lien si la page d'abonnement est fermée", () => {
    const markup = html({ audience: "owner", billingLink: false });
    assert.equal(markup.includes("href="), false);
    assert.match(markup, /nouvelles commandes sont en pause/);
  });
});
