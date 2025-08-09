import type { Component } from "solid-js";
import { createSignal, onMount, createEffect, onCleanup } from "solid-js";
import Circle from "./Circle.tsx"

const NavToggle: Component = () => {
  let buttonRef;

  const controlsId = "menu-content";

  const [isOpen, setIsOpen] = createSignal(false);

  const parentClassList = () => buttonRef.parentElement.classList;

  const handleClick = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape" && isOpen()) setIsOpen(false);
  };

  createEffect(() => {
    parentClassList().toggle("is-open", isOpen());
  });

  onMount(() => {
    parentClassList().add("peer", "group");
    document.addEventListener("keydown", handleKeydown);

    onCleanup(() => {
      document.removeEventListener("keydown", handleKeydown);
    });
  });

  return (
    <button
      ref={buttonRef}
      aria-controls={controlsId}
      aria-label="Hlavné menu"
      aria-expanded={isOpen()}
      onClick={handleClick}
      class="absolute right-3 md:hidden"
    >
      <Circle>
      <svg
        class={`h-8 [&_path]:duration-250
          group-[.is-open]:[&_path:nth-child(odd)]:opacity-0`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill="none"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M3 6h18"></path>
        <path d="M3 12h18"></path>
        <path d="M3 18h18"></path>
      </svg>
      </Circle>
    </button>
  );
};

export default NavToggle;
