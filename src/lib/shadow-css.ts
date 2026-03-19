import globalCss from "~/styles/global.css?inline";
import poppins400 from "@fontsource/poppins/400.css?inline";
import poppins500 from "@fontsource/poppins/500.css?inline";
import poppins600 from "@fontsource/poppins/600.css?inline";

/**
 * Tailwind CSS prepared for use inside declarative shadow DOM.
 *
 * 1. Replace :root with :root,:host so theme vars apply to shadow host
 * 2. Extract @property declarations (browsers ignore them inside shadow DOM)
 *    and convert initial values to regular CSS variables as a fallback
 * 3. Convert rem units to px (rem references document root, not shadow host)
 *
 * @see https://github.com/tailwindlabs/tailwindcss/issues/15005
 */

const REM_BASE = 16;

function remToPx(css: string): string {
  return css.replace(
    /(-?\d*\.?\d+)rem\b/g,
    (_, value) => `${parseFloat(value) * REM_BASE}px`,
  );
}

const propertyRules: string[] = [];
const vars: string[] = [];

const combined = [poppins400, poppins500, poppins600, globalCss].join("\n");

export const shadowCss = remToPx(
  combined
    .replaceAll(":root", ":root,:host")
    .replace(
      /@property\s+(--[\w-]+)\s*\{([^}]*)\}/g,
      (match, name, body) => {
        propertyRules.push(match);
        const initialValue = body
          .match(/initial-value:\s*([^;\n}]+)/)?.[1]
          ?.trim();
        if (initialValue) vars.push(`${name}:${initialValue}`);
        return "";
      },
    ) +
    (vars.length > 0 ? `\n*,::before,::after{${vars.join(";")}}` : ""),
);

export const propertyCss = propertyRules.join("\n");
