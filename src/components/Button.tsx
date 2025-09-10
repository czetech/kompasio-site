import type { Component } from "solid-js";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import Circle from "~/components/Circle.tsx";

const Button: Component = (props) => {
  const [, otherProps] = splitProps(props, ["class", "icon"]);

  return (
    <a
      class="inline-flex h-8 items-center rounded-full border-y-2 border-r-2"
      classList={{ [props.class]: props.class }}
      {...otherProps}
    >
      <Circle>
        <Dynamic component={props.icon} />
      </Circle>
      <span
        classList={{
          "pr-6 pl-4": !props.compact,
          "text-sm pr-4 pl-3": props.compact,
        }}
      >
        {props.text}
      </span>
    </a>
  );
};

export default Button;
