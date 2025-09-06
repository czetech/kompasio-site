import type { Component } from "solid-js";
import { createSignal, onMount, createEffect, onCleanup } from "solid-js";
import Circle from "./Circle.tsx";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";

const NavSearch: Component = () => {
  const [isActive, setIsActive] = createSignal(true);

  const handleClick = () => {
    setIsActive((isActive) => !isActive);
  };

  return (
    <div
      onClick={handleClick}
      class="flex h-8 w-8 md:w-64 duration-250 items-center rounded-full border-2 px-2 gap-x-2"
    >
      <Search class="w-5 h-5 flex-none" />
      <Show when={isActive()}>
        <input class="w-full" />
        <X class="w-5 h-5 flex-none" />
      </Show>
    </div>
  );
};

export default NavSearch;
