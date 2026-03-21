import type { Component } from "solid-js";
import {
  createSignal,
  onMount,
  createEffect,
  onCleanup,
  createMemo,
  on,
} from "solid-js";
import Circle from "./Circle.tsx";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createPresence } from "@solid-primitives/presence";
import { navigate } from "astro:transitions/client";

const Nav: Component = (props) => {
  let searchInputRef;

  const searchPathname = "/vyhladavanie";

  const [pathname, setPathname] = createSignal(props.pathname);
  const [isTransitioning, setIsTransitioning] = createSignal(false);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");

  const { isMounted: isTransitioningAfter } = createPresence(isTransitioning, {
    transitionDuration: 100,
  });

  const { isVisible: isLogoInvisible, isMounted: isLogoBackground } =
    createPresence(isSearchOpen, { transitionDuration: 250 });

  const isSearchPathname = () => window.location.pathname === searchPathname;

  const initSearch = () => {
    if (isSearchPathname()) {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") ?? "");
      setIsSearchOpen(true);
    }
  };

  const handleAstroBeforeSwap = () => {
    setIsTransitioning(true);
  };

  const handleAstroAfterSwap = () => {
    setIsTransitioning(false);
    setPathname(window.location.pathname);
    initSearch();
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      setIsMenuOpen(false);
    }
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen());
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    searchInputRef.focus();
  };

  const handleSearchClearClick = (e) => {
    setSearchQuery("");
    searchInputRef.focus();
    event.stopPropagation();
  };

  const handleSearchInput = (e) => {
    setSearchQuery(e.currentTarget.value);
  };

  createEffect(() => {
    if (!isTransitioningAfter()) {
      setIsMenuOpen(false);
      if (!isSearchPathname()) setIsSearchOpen(false);
    }
  });

  createEffect(() => {
    if (isSearchOpen()) {
      searchInputRef.focus();
      if (!isSearchPathname()) navigate(searchPathname);
    } else {
      setSearchQuery("");
    }
  });

  createEffect(
    on(
      searchQuery,
      (searchQuery) => {
        if (isSearchOpen()) {
          const url = new URL(searchPathname, window.location.href);
          if (searchQuery) url.searchParams.set("q", searchQuery);
          navigate(url, { history: "replace" });
        }
      },
      { defer: true },
    ),
  );

  onMount(() => {
    if (props.pathname == null) setPathname(window.location.pathname);

    makeEventListener(document, "astro:before-swap", handleAstroBeforeSwap);
    makeEventListener(document, "astro:after-swap", handleAstroAfterSwap);
    makeEventListener(document, "keydown", handleKeydown);

    initSearch();
  });

  return (
    <nav class="relative flex flex-col items-center">
      <div class="flex h-8 w-full items-center justify-center md:justify-start">
        <div
          class="h-7 duration-250 md:z-10 md:h-8 md:opacity-100"
          classList={{
            "z-10": !isLogoBackground(),
            "opacity-0": isLogoInvisible(),
          }}
        >
          {props.children}
        </div>
      </div>
      <div
        class={`absolute grid w-full grid-cols-[1fr_auto] gap-x-4
          md:grid-cols-[auto_1fr_auto] md:before:w-48`}
      >
        <div
          data-nav-search
          onClick={handleSearchClick}
          class={`bg-shuttle-white flex w-full items-center gap-x-2 rounded-full
            border-2 duration-250 md:justify-self-center md:px-1`}
          classList={{
            "max-w-8 md:max-w-64": !isSearchOpen(),
            "max-w-full md:max-w-5xl px-1": isSearchOpen(),
          }}
        >
          <div class="p-1">
            <Search class="h-5 w-5" />
          </div>
          <input
            ref={searchInputRef}
            value={searchQuery()}
            onInput={handleSearchInput}
            placeholder={props.searchPlaceholder}
            class="focus:outline-none md:w-full"
            classList={{
              "w-0 pointer-events-none": !isSearchOpen(),
              "w-full": isSearchOpen(),
            }}
            disabled={!isSearchOpen()}
          />
          <Show when={isSearchOpen()}>
            <button
              onClick={handleSearchClearClick}
              class="p-1 duration-250"
              classList={{ "opacity-0": !searchQuery() }}
            >
              <X class="h-5 w-5" />
            </button>
          </Show>
        </div>
        <div class="flex justify-end md:w-48">
          <button data-nav-menu-button onClick={handleMenuClick}>
            <Circle>
              <svg
                class="[&_path]:duration-250"
                classList={{
                  "[&_path:nth-child(odd)]:opacity-0": isMenuOpen(),
                }}
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
      </div>
      <div
        data-nav-menu
        class="grid duration-250"
        classList={{
          "grid-rows-[1fr]": isMenuOpen(),
          "invisible grid-rows-[0fr]": !isMenuOpen(),
        }}
      >
        <div
          data-nav-menu-content
          class="overflow-hidden duration-500"
          classList={{ "opacity-0": !isMenuOpen() }}
        >
          <div
            class={
              "flex flex-col items-center gap-y-2 pt-2 md:flex-row md:pt-4"
            }
          >
            <For each={props.navItems}>
              {(navItem, index) => {
                const isActive = createMemo(() =>
                  navItem.test
                    ? new RegExp(navItem.test).test(pathname())
                    : navItem.href === pathname(),
                );
                return (
                  <a
                    href={navItem.href}
                    class={`border-current/50 md:not-first:pl-4
                    md:not-last:border-r-2 md:not-last:pr-4`}
                    classList={{
                      "font-semibold": isActive(),
                    }}
                  >
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
