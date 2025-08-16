import type { Component } from "solid-js";
import { journeyStore } from "~/stores/journey";
import InlineButton from "./InlineButton";
import { createPresence } from "@solid-primitives/presence";

const StepListClear: Component = (props) => {
  const { isVisible, isMounted } = createPresence(
    () => journeyStore.state.journeys?.[props.journeyUuid],
    { transitionDuration: 250 },
  );

  const handleClick = () => {
    if (window.confirm("Ste si istý, že chcete vymazať priebeh celého návodu?"))
      journeyStore.deleteJourney(props.journeyUuid);
  };

  return (
    <p
      classList={{ invisible: !isMounted(), "opacity-0": !isVisible() }}
      class="border-red-orange border-t pt-3 text-xs duration-250 md:pt-4"
    >
      <span>Ak chcete vymazať priebeh, môžete </span>
      <InlineButton onClick={handleClick}>
        označiť všteko ako nevybavené
      </InlineButton>
      <span>.</span>
    </p>
  );
};

export default StepListClear;
