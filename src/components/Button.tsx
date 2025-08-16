import type { Component } from "solid-js";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import Circle from "~/components/Circle.tsx";

const Button: Component = (props) => {
  const [, otherProps] = splitProps(props, ["icon"]);

  return (
    <a
      class="inline-flex h-8 items-center rounded-full border-y-2 border-r-2"
      {...otherProps}
    >
      <Circle>{props.icon}</Circle>
      <span class="pr-6 pl-4">{props.text}</span>
    </a>
  );
};

export default Button;
