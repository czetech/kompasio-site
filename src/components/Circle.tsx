import type { Component } from "solid-js";

const Circle: Component = (props) => {
  return <div class="h-8 w-8 rounded-full border-2 flex items-center p-1" {...props} />;
};

export default Circle;
