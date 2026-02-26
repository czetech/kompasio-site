import type { Component } from "solid-js";
import { createSignal, onMount, onCleanup } from "solid-js";
import path from "pathe";

const StepListItem: Component = (props) => {
  const stepPath = () =>
    // TODO: merge with journeyStep (astro) function
    path.join(
      "/zivotne-situacie",
      props.journeySlug,
      props.stepIndex ? props.stepIndex.toString() : null,
    );

  const [isActive, setIsActive] = createSignal(props.pathname === stepPath());

  const handleAfterSwap = () => {
    setIsActive(window.location.pathname === stepPath());
  };

  onMount(() => {
    document.addEventListener("astro:after-swap", handleAfterSwap);

    onCleanup(() => {
      document.removeEventListener("astro:after-swap", handleAfterSwap);
    });
  });

  return (
    <a
      href={stepPath()}
      class="text-vibrant-blue hover:underline"
      classList={{ "font-semibold": isActive() }}
    >
      <Show when={props.numbering && props.stepIndex}>
        <span>{props.stepIndex}. </span>
      </Show>
      <span>{props.title}</span>
    </a>
  );
};

export default StepListItem;
