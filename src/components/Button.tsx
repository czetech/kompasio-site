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
      <span class="pr-6 pl-4" classList={{ "text-sm": props.small }}>
        {props.text}
      </span>
    </a>
  );
};

export default Button;
