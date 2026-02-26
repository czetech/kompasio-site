import StepButton from "./StepButton.tsx";
import ChevronLeft from "lucide-solid/icons/chevron-left";
import ChevronRight from "lucide-solid/icons/chevron-right";
import { journeyStore } from "~/stores/journey";
import { createEffect, createSignal, on } from "solid-js";
import path from "pathe";

const StepPagination: Component = (props) => {
  const stepState = journeyStore.getStepState(
    props.journeyUuid,
    props.stepUuid,
  );

  const [triggeredComplete, setTriggeredComplete] = createSignal(false);

  const stepPath = (stepIndex) =>
    // TODO: merge with journeyStep (astro) function
    path.join(
      "/zivotne-situacie",
      props.journeySlug,
      stepIndex ? stepIndex.toString() : null,
    );

  createEffect(
    on(
      () => stepState()?.isCompleted,
      (isCompleted) => {
        setTriggeredComplete(isCompleted);
      },
      { defer: true },
    ),
  );

  return (
    <div
      class={`flex flex-col justify-between gap-x-8 gap-y-4 lg:flex-row-reverse
        lg:items-center`}
      classList={{ "!justify-end": props.previousStepIndex === null }}
    >
      <Show when={props.nextStepIndex}>
        <StepButton
          secondary={!stepState()?.isCompleted}
          classList={{
            "motion-safe:animate-spring": triggeredComplete(),
          }}
          style="--spring-shift: -1rem;"
          class={`flex max-w-full min-w-0 items-center gap-x-2 self-end pr-1
            duration-250 lg:self-auto lg:pr-2`}
          href={stepPath(props.nextStepIndex)}
        >
          <div class="flex min-w-0 flex-col">
            <div>
              {props.type === "journey" ? "Nasledujúci krok" : "Čítať ďalej"}
            </div>
            <div class="truncate text-xs">{props.nextStepTitle}</div>
          </div>
          <ChevronRight class="flex-none" />
        </StepButton>
      </Show>
      <Show when={props.previousStepIndex !== null}>
        <StepButton
          secondary
          class={`flex max-w-full min-w-0 items-center gap-x-2 self-start pl-1
            lg:self-auto lg:pl-2`}
          href={stepPath(props.previousStepIndex)}
        >
          <ChevronLeft class="flex-none" />
          <div class="flex min-w-0 flex-col">
            <div>
              {props.type === "journey" ? "Predchádzajúci krok" : "Naspäť"}
            </div>
            <div class="truncate text-xs">{props.previousStepTitle}</div>
          </div>
        </StepButton>
      </Show>
    </div>
  );
};

export default StepPagination;
