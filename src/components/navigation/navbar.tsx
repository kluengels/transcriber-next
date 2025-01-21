// Navbar with hamburger menu on smaller screens

import { BsRobot } from "react-icons/bs";
import { MenuItems } from "./MenuItems";
import Link from "next/link";
import { createSupaseServerClient } from "@/lib/supabase/server";
import AuthButton from "./AuthButton";
import Hamburger from "./Hamburger";

export default async function Navbar() {
  const supabase = await createSupaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <nav className="h-20 border-b-[1px] border-white bg-accent px-2">
        <div className="container flex h-full items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo and Link to home page */}
            <div className="h-16 w-16 p-2">
              <Link href="/">
                <BsRobot className="h-full w-full text-action" />
              </Link>
            </div>
            <p className="text-3xl">
              HANS <span className="hidden font-thin lg:inline">|</span>
            </p>

            {/* Menu items on larger screens */}
            <div className="hidden gap-2 lg:flex">
              <MenuItems />
            </div>
          </div>

          {/* Login button on larger screens */}
          <div className="hidden items-center gap-2 lg:flex print:hidden">
            <AuthButton user={user} />
          </div>

          {/* Hamburger menu on smaller screens */}
          <div className="inline lg:hidden print:hidden">
            <Hamburger user={user} />
          </div>
        </div>
      </nav>
    </>
  );
}
