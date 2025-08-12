import type { Component } from "solid-js";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import Circle from "~/components/Circle.tsx"

const Button: Component = (props) => {
  const [, otherProps] = splitProps(props, ["icon"]);

  return (
    <a class="border-y-2 border-r-2 rounded-full inline-flex h-8 items-center" {...otherProps}>
      <Circle>{props.icon}</Circle>
      <span class="pl-4 pr-6">{props.text}</span>
    </a>
  );
};

export default Button;
