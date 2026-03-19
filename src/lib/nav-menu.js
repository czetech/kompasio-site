/**
 * Plain JS replacement for Solid's isMenuOpen() signal in Nav.tsx.
 * Works on pre-rendered HTML without the Astro/Solid JS bundle.
 *
 * Targets elements by data attributes:
 * - [data-nav-menu-button] — the hamburger button
 * - [data-nav-menu-button] svg — the SVG icon (odd paths get hidden)
 * - [data-nav-menu] — the menu grid container
 * - [data-nav-menu-content] — the inner content div
 * - [data-nav-search] — the search field (redirects to /vyhladavanie)
 */
function initNavMenu() {
  const button = document.querySelector("[data-nav-menu-button]");
  const menu = document.querySelector("[data-nav-menu]");
  const content = document.querySelector("[data-nav-menu-content]");
  const svg = button?.querySelector("svg");

  if (!button || !menu || !content) return;

  let open = false;

  function toggle() {
    open = !open;

    if (open) {
      menu.classList.add("grid-rows-[1fr]");
      menu.classList.remove("invisible", "grid-rows-[0fr]");
      content.classList.remove("opacity-0");
      svg?.classList.add("[&_path:nth-child(odd)]:opacity-0");
    } else {
      menu.classList.remove("grid-rows-[1fr]");
      menu.classList.add("invisible", "grid-rows-[0fr]");
      content.classList.add("opacity-0");
      svg?.classList.remove("[&_path:nth-child(odd)]:opacity-0");
    }
  }

  button.addEventListener("click", toggle);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) {
      toggle();
    }
  });

  const search = document.querySelector("[data-nav-search]");
  if (search) {
    search.addEventListener("click", () => {
      window.location.href = "/vyhladavanie";
    });
  }
}

initNavMenu();
