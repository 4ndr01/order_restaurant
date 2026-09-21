import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export default function BrandHeader() {
  return (
    <header className="mx-auto w-full max-w-md px-6 pt-8">
      <Link href="/" className="text-lg font-extrabold tracking-tight">
        {BRAND_NAME}
      </Link>
    </header>
  );
}
