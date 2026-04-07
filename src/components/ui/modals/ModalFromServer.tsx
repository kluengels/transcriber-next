"use client";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { BiX } from "react-icons/bi";
import { useOnClickOutside } from "usehooks-ts";

type HtmlModalProps = {
  children: ReactNode;
};

/**
 * Modal called from a sever component, uses url params to open and close
 */
function HtmlModalFromServer({ children }: HtmlModalProps) {
  // router allwows to close modal
  const router = useRouter();

  // ref to modal
  const modal = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    if (!modal.current) return;
    modal.current.showModal();
  }, [modal]);

  // Close modal when user clicks outside
  const innerModalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(innerModalRef as RefObject<HTMLElement>, () =>
    router.back(),
  );

  return (
    <dialog
      className="bg-background m-auto shadow-2xl backdrop-blur-md backdrop:bg-black/50 md:w-[500px]"
      ref={modal}
    >
      <div ref={innerModalRef}>
        <div className="pt-3 pr-3 text-right">
          <button
            onClick={() => {
              router.back();
            }}
            className="p-1"
          >
            <BiX className="h-6 w-6" />
          </button>
        </div>

        <div className="px-5 pb-6"> {children}</div>
      </div>
    </dialog>
  );
}

export default HtmlModalFromServer;
