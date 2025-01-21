"use client";
import { setCookie } from "cookies-next";
import { useState } from "react";

import { BiX } from "react-icons/bi";

/**
 * Warning indicates that app is still in development. If closed by user, a cookie will be set to rember the choice
 */
export default function Warning() {
  const [showWarning, setShowWarning] = useState(true);
  if (showWarning) {
    return (
      <>
        <div className="mb-5 flex justify-between bg-warning p-2 font-light text-white shadow-md">
          <span>
            Warning: Though functional, this app is still in development and not
            commercial (yet). Feel free to test HANS, but please don&apos;t use
            the app whith any sensitive data.
          </span>
          <button
            className="flex justify-start"
            aria-label="close warning"
            onClick={() => {
              // set cookie to memorize users choise
              setCookie("showWarning", "false");
              setShowWarning(false);
            }}
          >
            <BiX className="ml-5 h-6 w-6" />
          </button>
        </div>
      </>
    );
  }
}
