import { formatTime, parisDay } from "./format";
import { STATUS_LABELS, type Order, type PaymentStatus } from "./types";

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  non_requis: "Sur place",
  en_attente: "En attente",
  paye: "Payé en ligne",
  expire: "Non payé",
  rembourse: "Remboursé",
};

const HEADER = [
  "Numéro",
  "Date",
  "Heure",
  "Table",
  "Statut",
  "Paiement",
  "Détail",
  "Articles",
  "Total TTC (€)",
  "Précision pour la cuisine",
];

/**
 * Cellule texte sûre pour Excel : une valeur saisie par un client qui
 * commence par = + - @ serait exécutée comme une formule à l'ouverture du
 * fichier. On la neutralise avec une apostrophe, puis on échappe les
 * guillemets.
 */
function text(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function amount(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

/**
 * Export au format attendu par Excel en français : point-virgule, virgule
 * décimale, lignes CRLF et marque UTF-8 en tête pour conserver les accents.
 */
export function ordersToCsv(orders: Order[]): string {
  const lines = [HEADER.map(text).join(";")];
  for (const order of orders) {
    const [year, month, day] = parisDay(order.createdAt).split("-");
    lines.push(
      [
        text(order.reference),
        text(`${day}/${month}/${year}`),
        text(formatTime(order.createdAt)),
        text(order.tableName),
        text(STATUS_LABELS[order.status]),
        text(PAYMENT_LABELS[order.paymentStatus]),
        text(order.lines.map((line) => `${line.quantity} × ${line.name}`).join(", ")),
        String(order.lines.reduce((sum, line) => sum + line.quantity, 0)),
        amount(order.total),
        text(order.note),
      ].join(";"),
    );
  }
  return `﻿${lines.join("\r\n")}\r\n`;
}
