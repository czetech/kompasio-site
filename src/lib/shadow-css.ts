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
 * 4. Set baseline styles on :host to prevent inheritance from outer page
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

const fontFaceRules: string[] = [];
const poppinsCss = [poppins400, poppins500, poppins600].join("\n");

// Extract @font-face rules — they must live in the document scope,
// not inside shadow DOM, to register in the browser's font cache.
poppinsCss.replace(/@font-face\s*\{[^}]*\}/g, (match) => {
  fontFaceRules.push(match);
  return "";
});

/** CSS with @font-face rules for injection into the document scope. */
export const fontCss = fontFaceRules.join("\n");

export const shadowCss = remToPx(
  globalCss
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
    (vars.length > 0 ? `\n*,::before,::after{${vars.join(";")}}` : "") +
    "\n:host{background-color:var(--color-shuttle-white);font-size:16px;text-align:initial;}",
);

export const propertyCss = propertyRules.join("\n");
