import type { Component } from "solid-js";

const Circle: Component = (props) => {
  return (
    <div
      class="flex h-8 w-8 items-center rounded-full border-2 p-1"
      {...props}
    />
  );
};

export default Circle;
