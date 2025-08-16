import type { Component } from "solid-js";
import { journeyStore } from "~/stores/journey";
import { createMemo } from "solid-js";
import Check from "lucide-solid/icons/check";
import Ellipsis from "lucide-solid/icons/ellipsis";

const StepStatus: Component = (props) => {
  const tasks = props.stepTasks ?? [];
  const stepState = journeyStore.getStepState(
    props.journeyUuid,
    props.stepUuid,
  );

  const viewBoxSize = 32;
  const strokeWidth = 4;
  const viewBoxHalfSize = viewBoxSize / 2;
  const iconSize = viewBoxSize - strokeWidth * 2;
  const iconXY = (viewBoxSize - iconSize) / 2;
  const radius = (viewBoxSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = () => circumference * (1 - percentage());
  const iconAttrs = {
    class: "text-frontier-gray duration-250",
    size: iconSize,
    x: iconXY,
    y: iconXY,
  };
  const circleAttrs = {
    cx: viewBoxHalfSize,
    cy: viewBoxHalfSize,
    fill: "transparent",
    r: radius,
    "stroke-width": strokeWidth,
  };

  const percentage = createMemo(() => {
    if (!tasks.length) return 0;
    let completedTaskCount = 0;
    tasks.forEach((task) => {
      completedTaskCount += +(stepState()?.tasks?.[task.uuid]?.isDone ?? false);
    });
    return completedTaskCount / tasks.length;
  });

  const isCompleted = createMemo(() => stepState()?.isCompleted);

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      class={props.class}
      aria-label={`Priebeh: ${Math.round(percentage() * 100)}%`}
    >
      <circle
        class="stroke-frontier-gray fill-shuttle-white"
        {...circleAttrs}
      />
      <Ellipsis
        classList={{ "opacity-0": !percentage() || isCompleted() }}
        {...iconAttrs}
      />
      <circle
        class="stroke-green-500 motion-safe:duration-250"
        stroke-dasharray={circumference}
        stroke-dashoffset={progressOffset()}
        stroke-linecap="round"
        transform={`rotate(-90 ${viewBoxHalfSize} ${viewBoxHalfSize})`}
        {...circleAttrs}
      />
      <circle
        cx={viewBoxHalfSize}
        cy={viewBoxHalfSize}
        r={radius + strokeWidth / 2}
        class="fill-green-500"
        classList={{ "opacity-0": !isCompleted() }}
      />
      <Check
        classList={{
          "opacity-0": !isCompleted(),
          "duration-250": isCompleted(),
        }}
        stroke-width="4"
        stroke-linecap="round"
        size={iconSize}
        x={iconXY}
        y={iconXY}
      />
    </svg>
  );
};

export default StepStatus;
