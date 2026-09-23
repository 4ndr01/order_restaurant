import "server-only";
import { BRAND_NAME } from "./brand";
import { sendEmail } from "./email";
import { formatPrice, formatTime } from "./format";
import type { Order } from "./types";

/**
 * Récapitulatif envoyé au client qui a laissé son email : reçu de paiement
 * quand il a payé en ligne, simple accusé de réception quand il règle en salle.
 */
export async function sendOrderReceipt(
  order: Order,
  restaurantName: string,
  trackingUrl: string,
): Promise<void> {
  if (!order.customerEmail) {
    return;
  }

  const lines = order.lines
    .map((line) => `  ${line.quantity} × ${line.name} — ${formatPrice(line.unitPrice * line.quantity)}`)
    .join("\n");

  const note = order.note ? `\nVotre précision : ${order.note}\n` : "";

  await sendEmail({
    to: order.customerEmail,
    subject: `Votre commande n° ${order.reference} — ${restaurantName}`,
    text:
      `Bonjour,\n\n` +
      `${restaurantName} a bien reçu votre commande n° ${order.reference}, ` +
      `passée à ${formatTime(order.createdAt)} (${order.tableName}).\n\n` +
      `${lines}\n\n` +
      `${order.paymentStatus === "paye" ? "Payé en ligne" : "Total"} : ${formatPrice(order.total)}\n${note}\n` +
      `Suivez la préparation en direct ici :\n${trackingUrl}\n\n` +
      `Bon appétit !\n\n— ${BRAND_NAME}`,
  });
}
