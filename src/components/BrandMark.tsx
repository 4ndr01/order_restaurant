/**
 * Monogramme WGK, tiré du logo fourni (public/brand/wegoodkim-logo.jpg).
 * Les icônes d'onglet (src/app/favicon.ico, icon.png, apple-icon.png) et
 * celles du manifeste reprennent la même image.
 */
export default function BrandMark({ className = "h-8 w-8 shrink-0" }: { className?: string }) {
  return (
    // Petite image déjà optimisée : le composant Image de Next.js n'apporte rien ici.
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/mark-192.png" alt="" aria-hidden="true" width={64} height={64} className={className} />
  );
}
