import React from "react";
import PageTitleAnimated from "./PageTitleAnimated";

/**
 * Centered wrapper component for forms with animated page title, form itesel is in dashed border with max-w-96
 */
export default function NarrowForm({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-96">
      <PageTitleAnimated>{title}</PageTitleAnimated>
      <div className="flex justify-center">
        <div className="flex w-full flex-col border-[1px] border-dotted border-accent p-5 shadow-sm">
          {children}
        </div>
      </div>
    </section>
  );
}
