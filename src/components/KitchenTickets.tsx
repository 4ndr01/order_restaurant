"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { formatPrice, formatTime } from "@/lib/format";
import type { Order } from "@/lib/types";

/**
 * Tickets cuisine, imprimés depuis la page elle-même : pendant l'impression,
 * seul ce bloc est visible (voir `printing-tickets` dans globals.css). Cette
 * façon de faire marche aussi sur iPad, où imprimer un cadre caché ne
 * fonctionne pas. Largeur pensée pour les imprimantes à tickets de 80 mm.
 */
export default function KitchenTickets({
  orders,
  onDone,
}: {
  orders: Order[];
  onDone: () => void;
}) {
  useEffect(() => {
    if (orders.length === 0) return;
    const body = document.body;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      body.classList.remove("printing-tickets");
      onDone();
    };
    window.addEventListener("afterprint", finish, { once: true });
    body.classList.add("printing-tickets");
    let fallback: number | undefined;
    // Laisse le navigateur peindre les tickets avant d'ouvrir l'impression.
    const timer = window.setTimeout(() => {
      window.print();
      // Chrome bloque jusqu'à la fin de l'impression ; Safari rend la main
      // tout de suite et signale la fin avec « afterprint ».
      fallback = window.setTimeout(finish, 60_000);
    }, 50);
    return () => {
      finished = true;
      window.clearTimeout(timer);
      window.clearTimeout(fallback);
      window.removeEventListener("afterprint", finish);
      body.classList.remove("printing-tickets");
    };
  }, [orders, onDone]);

  if (orders.length === 0) return null;

  return createPortal(
    <div className="ticket-print-root" aria-hidden="true">
      {orders.map((order) => (
        <section key={order.id} className="kitchen-ticket">
          <p className="kitchen-ticket-table">{order.tableName}</p>
          <p className="kitchen-ticket-meta">
            N° {order.reference} · {formatTime(order.createdAt)}
          </p>
          <hr />
          <ul>
            {order.lines.map((line, index) => (
              <li key={`${line.menuItemId}-${index}`}>
                <p className="kitchen-ticket-line">
                  {line.quantity} × {line.name}
                </p>
                {line.options?.map((option, optionIndex) => (
                  <p key={optionIndex} className="kitchen-ticket-option">
                    {option.price > 0 ? "+ " : "· "}
                    {option.choice}
                  </p>
                ))}
              </li>
            ))}
          </ul>
          {order.note && (
            <>
              <hr />
              <p className="kitchen-ticket-note-title">Précisions</p>
              <p className="kitchen-ticket-note">{order.note}</p>
            </>
          )}
          <hr />
          <p className="kitchen-ticket-payment">
            {order.paymentStatus === "paye" ? "PAYÉ EN LIGNE" : "À ENCAISSER"} ·{" "}
            {formatPrice(order.total)}
          </p>
        </section>
      ))}
    </div>,
    document.body,
  );
}
