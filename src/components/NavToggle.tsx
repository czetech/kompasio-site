import type { Component } from "solid-js";
import { createSignal, onMount, createEffect, onCleanup } from "solid-js";

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
      <svg
        class={`h-8 [&_path]:duration-250
          group-[.is-open]:[&_g_path:nth-child(odd)]:opacity-0`}
        viewBox="0 0 32 32"
        stroke="currentColor"
        fill="none"
        stroke-width="1"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="15"></circle>
        <g>
          <path d="M8 11h16"></path>
          <path d="M8 16h16"></path>
          <path d="M8 21h16"></path>
        </g>
      </svg>
    </button>
  );
};

export default NavToggle;
