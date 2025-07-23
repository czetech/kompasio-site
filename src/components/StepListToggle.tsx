import type { Component } from "solid-js";
import { createSignal, onMount, createEffect, onCleanup } from "solid-js";
import { createPresence } from "@solid-primitives/presence";
import ListOrdered from "lucide-solid/icons/list-ordered";
import X from "lucide-solid/icons/x";

const StepListToggle: Component = () => {
  let buttonRef;

  const openClosePresenceOptions = { transitionDuration: 100 };

  const [isOpen, setIsOpen] = createSignal(false);
  const { isVisible: isOpenVisible, isMounted: isOpenMounted } = createPresence(
    () => !isOpen(),
    openClosePresenceOptions,
  );
  const { isVisible: isCloseVisible, isMounted: isCloseMounted } =
    createPresence(isOpen, openClosePresenceOptions);

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
    parentClassList().add("peer");
    document.addEventListener("keydown", handleKeydown);

    onCleanup(() => {
      document.removeEventListener("keydown", handleKeydown);
    });
  });

  return (
    <button
      ref={buttonRef}
      aria-controls="step-list-content"
      aria-label="Zoznam krokov"
      class={`bg-vibrant-blue text-shuttle-white fixed right-6 bottom-6 flex
        h-12 w-12 items-center justify-center rounded-full shadow-lg md:hidden
        [&_svg]:absolute [&_svg]:h-8 [&_svg]:w-8 [&_svg]:stroke-1
        [&_svg]:duration-150`}
      aria-expanded={isOpen()}
      onClick={handleClick}
    >
      <Show when={isOpenMounted()}>
        <ListOrdered classList={{ "opacity-0": isCloseMounted() }} />
      </Show>
      <Show when={isCloseMounted()}>
        <X classList={{ "opacity-0": isOpenMounted() }} />
      </Show>
    </button>
  );
};

export default StepListToggle;
