import Button from "./Button2.tsx";
import ChevronLeft from "lucide-solid/icons/chevron-left";
import ChevronRight from "lucide-solid/icons/chevron-right";
import { journeyStore } from "~/stores/journey";
import { createEffect, createSignal, on } from "solid-js";
import path from "pathe";

const StepPagination: Component = (props) => {
  const stepState = journeyStore.getStepState(props.journeyUuid, props.stepUuid); 

  const [triggeredComplete, setTriggeredComplete] = createSignal(false);

const stepPath = (stepIndex) =>
    // TODO: merge with journeyStep (astro) function
    path.join("/zivotne-situacie", props.journeySlug, stepIndex ? stepIndex.toString() : null); 

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
      class={`flex flex-col-reverse justify-between gap-x-8 gap-y-4 md:flex-row
        md:items-center [&_a]:flex [&_a]:items-center [&_a]:gap-x-1 [&_a]:!py-2
        md:[&_a]:gap-x-2 [&_a>div]:flex [&_a>div]:flex-col [&_a>div]:items-start
        [&_a>div>span:nth-child(2)]:text-xs [&_svg]:flex-none`}
      classList={{ "!justify-end": props.previousStepIndex === null }}
    >
      <Show when={props.previousStepIndex !== null}>
        <Button
          secondary
          class="self-start pl-1 md:self-auto md:pl-2"
          href={stepPath(props.previousStepIndex)}
        >
          <ChevronLeft />
          <div>
            <span>Predchádzajúci krok</span>
            <span>{props.previousStepTitle}</span>
          </div>
        </Button>
      </Show>
      <Show when={props.nextStepIndex}>
        <Button
          secondary={!stepState()?.isCompleted}
          classList={{
            "motion-safe:animate-spring": triggeredComplete(),
          }}
          style="--spring-shift: -1rem;"
          class="self-end pr-1 duration-250 md:self-auto md:pr-2"
          href={stepPath(props.nextStepIndex)}
        >
          <div>
            <span>Nasledujúci krok</span>
            <span>{props.nextStepTitle}</span>
          </div>
          <ChevronRight />
        </Button>
      </Show>
    </div>
  );
};

export default StepPagination;
