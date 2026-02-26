import type { Component } from "solid-js";
import { splitProps, createSignal, createMemo, onMount } from "solid-js";
import { makeResizeObserver } from "@solid-primitives/resize-observer";

const Shrinkwrap: Component = (props) => {
  let containerRef;
  let contentRef;

  const [, otherProps] = splitProps(props, ["class"]);

  const [widthDiff, setWidthDiff] = createSignal(0);

  const translateX = createMemo(() =>
    widthDiff ? `translateX(${widthDiff()}px)` : null,
  );

  const handleContainerResizeObserver = () => {
    const { width: containerWidth } = containerRef.getBoundingClientRect();
    const { width: contentWidth } = contentRef.getBoundingClientRect();
    setWidthDiff(contentWidth - containerWidth);
  };

  onMount(() => {
    makeResizeObserver(handleContainerResizeObserver).observe(containerRef);
  });

  return (
    <div
      class="flex"
      classList={{ [props.class]: props.class }}
      {...otherProps}
    >
      <div ref={containerRef}>
        <div ref={contentRef} class="inline">
          {props.children}
        </div>
      </div>
      <div style={{ transform: translateX() }}>{props.after}</div>
    </div>
  );
};

export default Shrinkwrap;
