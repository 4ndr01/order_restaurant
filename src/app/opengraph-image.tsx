import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_NAME } from "@/lib/brand";
import { ANNOUNCED_PLAN, TRIAL_PERIOD_DAYS, formatPlanPrice } from "@/lib/plans";

export const alt = `${BRAND_NAME} : commande à table, payée sur votre compte Stripe`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const price = formatPlanPrice(ANNOUNCED_PLAN.priceCents);
  const mark = await readFile(join(process.cwd(), "public/brand/mark-192.png"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5efe0",
          color: "#1b2a21",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img
            src={`data:image/png;base64,${mark.toString("base64")}`}
            alt=""
            width={88}
            height={88}
          />
          <div style={{ display: "flex", fontSize: 36, fontWeight: 800, color: "#1f4d36" }}>
            {BRAND_NAME}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            La commande à table,
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            payée sur votre compte.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#1f4d36" }}>
          {`${TRIAL_PERIOD_DAYS} jours d'essai dès l'inscription, puis ${price}`}
        </div>
      </div>
    ),
    { ...size },
  );
}
