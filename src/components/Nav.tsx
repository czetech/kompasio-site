import type { Component } from "solid-js";
import { createSignal, onMount, createEffect, onCleanup, createMemo } from "solid-js";
import Circle from "./Circle.tsx";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";
import { makeEventListener } from "@solid-primitives/event-listener";

const Nav: Component = (props) => {
  const [pathname, setPathname] = createSignal(props.pathname);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const handleAstroAfterSwap = () => {
    setPathname(window.location.pathname);
  }

  const handleKeydown = (event) => {
    if (event.key === "Escape") setIsMenuOpen(false);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen());
  }

  onMount(() => {
    makeEventListener(document, "astro:after-swap", handleAstroAfterSwap);
    makeEventListener(document, "keydown", handleKeydown);
  });

  return (
    <nav class="flex flex-col items-center px-4 py-2">
      <div class="grid grid-cols-[1fr_auto_1fr] items-center w-full">
        <div class="md:order-1">
        </div>
        <div class="h-6 md:h-8 justify-self-start">
          {props.children}
        </div>
        <button
          onClick={handleMenuClick}
          class="order-2 justify-self-end"
        >
          <Circle>
            <svg
              class="[&_path]:duration-250"
              classList={{"[&_path:nth-child(odd)]:opacity-0": isMenuOpen()}}
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 6h18"></path>
              <path d="M3 12h18"></path>
              <path d="M3 18h18"></path>
            </svg>
          </Circle>
        </button>
      </div>
      <div
        class="grid duration-250"
        classList={{"grid-rows-[1fr]": isMenuOpen(), "invisible grid-rows-[0fr]": !isMenuOpen()}}
      >
        <div class="overflow-hidden duration-500" classList={{"opacity-0": !isMenuOpen()}}>
          <div
            class="flex flex-col items-center gap-y-2 py-2 md:flex-row"
          >
            <For each={props.navItems}>
              {(navItem, index) => {
                const isActive = createMemo(() => navItem.test ? new RegExp(navItem.test).test(pathname()) : navItem.href === pathname());
                const isExternal = createMemo(() => /^https?:\/\//.test(navItem.href));
                return (
                  <a
                    href={navItem.href}
                    target={isExternal() ? "_blank" : null}
                    class="border-current/50 md:not-last:border-r-2 md:not-first:pl-4 md:not-last:pr-4"
                    classList={{"after:content-['_↗']": isExternal(), "font-semibold": isActive(),}}>
                      {navItem.title}
                  </a>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
