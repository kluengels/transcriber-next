import { ReactNode } from "react";

/**
 * Renders h1 with typing animation
 */
export default function PageTitleAnimated({
  children,
}: {
  children: React.ReactNode;
}): ReactNode {
  return (
    <div className="w-max">
      <h1 className="mb-5 w-max animate-typing overflow-hidden whitespace-nowrap border-r-2    border-r-text">
        {children}
      </h1>
    </div>
  );
}

/**
 * Renders h1 with typing animation, extra large
 */
export function PageTitleAnimatedXxl({
  children,
}: {
  children: React.ReactNode;
}): ReactNode {
  return (
    <div className="w-max ">
      <h1 className="mb-5 w-max animate-typing overflow-hidden whitespace-nowrap border-r-2 border-r-text p-2 text-4xl md:text-5xl lg:text-7xl">
        {children}
      </h1>
    </div>
  );
}
