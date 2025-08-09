import type { Component } from "solid-js";
import { mergeProps } from "solid-js";
import ArrowUp from "lucide-solid/icons/arrow-up";
import Circle from "./Circle.tsx";

const CircleArrow: Component = (props) => {
  const merged = mergeProps({ direction: 0 }, props);

  return (
    <Circle>
      <ArrowUp style={{transform: `rotate(${merged.direction}deg)`}} />
    </Circle>
  );
};

export default CircleArrow;
