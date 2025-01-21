import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      height: {
        innerfull: "calc(100dvh - 8rem)", // 5rem navbar + 3rem footer
      },
      minHeight: {
        innerfull: "calc(100dvh - 8rem)",
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": {
            opacity: "1",
          },
          "20%,50%": {
            opacity: "0",
          },
        },
        typing: {
          "0%": {
            width: "0%",
            visibility: "hidden",
          },
          "100%": {
            width: "100%",
          },
        },
        blink: {
          "50%": {
            borderColor: "transparent",
          },
          "100%": {
            borderColor: "gray",
          },
        },
      },
      animation: {
        typing: "typing 2s steps(20) alternate, blink 0.9s infinite ",
        "caret-blink": "caret-blink 1.2s ease-out infinite",
      },
      colors: {
        background: "hsl(var(--background))",
        text: {
          DEFAULT: "hsl(var(--text-color))",
          foreground: "hsl(var(--accent-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        action: {
          DEFAULT: "hsl(var(--action))",
          foreground: "hsl(var(--accent-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--accent-foreground))",
        },
        actionlight: "var(--actionlight)",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
    plugin(function ({ addUtilities }) {
      const fallbackHeightUtilities = {
        "@supports not (height: 100dvh)": {
          ".h-dvh": { height: "100vh" },
          ".min-h-dvh": { "min-height": "100vh" },
          ".max-h-dvh": { "max-height": "100vh" },
        },
        "@supports not (height: 100lvh)": {
          ".h-lvh": { height: "100vh" },
          ".min-h-lvh": { "min-height": "100vh" },
          ".max-h-lvh": { "max-height": "100vh" },
        },
        "@supports not (height: 100svh)": {
          ".h-svh": { height: "100vh" },
          ".min-h-svh": { "min-height": "100vh" },
          ".max-h-svh": { "max-height": "100vh" },
        },
      };

      addUtilities(fallbackHeightUtilities);
    }),
  ],
} satisfies Config;
