import type { Component } from "solid-js";
import { onMount, createSignal, createEffect, createMemo } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { createPresence } from "@solid-primitives/presence";
import Check from "lucide-solid/icons/check";

import Button from "./Button2.tsx";
import InlineButton from "./InlineButton";
import { journeyStore } from "~/stores/journey";

const StepUI: Component = (props) => {
  let checkRef;

  const tasks = props.stepTasks ?? [];
  const stepState = journeyStore.getStepState(props.journeyUuid, props.stepUuid);

  const [triggeredComplete, setTriggeredComplete] = createSignal(false);
  const { isVisible: isCompleteVisible, isMounted: isCompleteMounted } =
    createPresence(() => !stepState()?.isCompleted, {
      transitionDuration: 250,
    });

  const isAllTasksDone = () =>
    tasks.every((task) => stepState()?.tasks?.[task.uuid]?.isDone);

  const handleTaskInput = (taskUuid) => (e) => {
    journeyStore.setTaskDone(
      props.journeyUuid, props.stepUuid,
      taskUuid,
      e.currentTarget.checked,
    );
  };

  const handleCompleteClick = () => {
    setTriggeredComplete(true);
    journeyStore.setCompleted(props.journeyUuid, props.stepUuid, true);
  };

  const handleUndoClick = () => {
    setTriggeredComplete(false);
    journeyStore.deleteStep(props.journeyUuid, props.stepUuid);
  };

  onMount(() => {
    const checkRefPath = checkRef.firstChild;
    checkRefPath.style.setProperty(
      "--path-length",
      `${checkRefPath.getTotalLength()}px`,
    );
  });

  return (
    <div class="border-red-orange mb-6 border-y py-3 md:mb-8 md:py-4">
      <Show when={tasks.length}>
        <div class="mb-4 flex flex-col gap-y-3 md:mb-6 md:gap-y-4">
          <p class="text-red-orange font-medium">Úlohy:</p>
          <For each={tasks}>
            {(task) => (
              <div class="flex items-center gap-x-3 md:gap-x-4">
                <input
                  type="checkbox"
                  id={`task-${task.uuid}`}
                  checked={stepState()?.tasks?.[task.uuid]?.isDone}
                  onInput={handleTaskInput(task.uuid)}
                  disabled={stepState()?.isCompleted}
                  class={`peer accent-red-orange h-5 w-5 flex-none
                  enabled:cursor-pointer md:h-6 md:w-6`}
                />
                <label
                  for={`task-${task.uuid}`}
                  class="peer-enabled:cursor-pointer"
                >
                  {task.body}
                </label>
              </div>
            )}
          </For>
        </div>
      </Show>
      <div class="grid items-center *:col-start-1 *:row-start-1">
        <Button
          disabled={!isCompleteVisible() || !isAllTasksDone()}
          onClick={handleCompleteClick}
          classList={{
            invisible: !isCompleteMounted(),
            "opacity-0": !isCompleteVisible(),
          }}
          class="justify-self-center duration-250"
        >
          {props.nextStepId ? "Vybavené, poďme ďalej!" : "Hotovo!"}
        </Button>
        <div
          classList={{ invisible: isCompleteMounted() }}
          class="flex items-center gap-x-4 md:gap-x-6"
        >
          <Check
            ref={checkRef}
            class="text-red-orange h-12 w-12 flex-none md:h-16 md:w-16"
            classList={{
              "motion-safe:[&_path]:animate-draw draw":
                triggeredComplete() && !isCompleteMounted(),
            }}
          />
          <div>
            <p class="text-red-orange font-medium">Vybavené!</p>
            <p>
              <span>Ak sa chcete vrátiť späť, môžete tento krok návodu </span>
              <InlineButton onClick={handleUndoClick}>
                označiť ako nevybavený
              </InlineButton>
              <span>.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepUI;
