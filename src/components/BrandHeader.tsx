import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { BRAND_NAME } from "@/lib/brand";

export default function BrandHeader() {
  return (
    <header className="mx-auto w-full max-w-md px-6 pt-8">
      <Link href="/" className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight">
        <BrandMark />
        {BRAND_NAME}
      </Link>
    </header>
  );
}
