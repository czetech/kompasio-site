import type { Component } from "solid-js";

const InlineButton: Component = (props) => {
  const handleKeydown = (event) => {
    if (["Enter", " "].indexOf(event.key) !== -1) event.target.click();
  };

  return (
    <span
      onKeydown={handleKeydown}
      role="button"
      tabindex="0"
      class="cursor-pointer font-medium underline"
      {...props}
    />
  );
};

export default InlineButton;
