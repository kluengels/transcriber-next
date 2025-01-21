import Link from "next/link";
import React from "react";
import { BiSolidHeart } from "react-icons/bi";

export default function Footer() {
  return (
    <footer className="h-12 bg-text text-white print:hidden">
      <div className="font-background container flex justify-center gap-1 bg-text px-2 py-2 text-center text-sm">
        made with <BiSolidHeart className="relative top-1 text-action" /> in
        Cologne |{" "}
        <Link href={"/imprint"} className="hover:text-action hover:underline">
          Imprint / Contact
        </Link>
      </div>
    </footer>
  );
}
