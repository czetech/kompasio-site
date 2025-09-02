import { createSignal, createEffect } from "solid-js";

const Toggle = (props) => {
  const handleClick = () => {
    props.onSet(!props.checked);
  };

  return (
    <button
      onClick={handleClick}
      class="text-vibrant-blue flex items-center gap-x-2"
    >
      <div
        class={`relative flex h-5 flex-none items-center rounded-full border-2
          pr-1 duration-200 focus:outline-none`}
        classList={{
          "bg-current": props.checked,
          "w-13": props.note != null,
          "w-9": props.note == null,
        }}
      >
        <div
          class={`relative left-[-2px] h-5 w-5 flex-none rounded-full border-2
            duration-200`}
          classList={{
            "bg-shuttle-white": props.checked,
            "translate-x-8": props.checked && props.note != null,
            "translate-x-4": props.checked && props.note == null,
          }}
        />
        <Show when={props.note != null && !props.checked}>
          <div class="flex flex-grow items-center justify-center text-sm">
            {props.note}
          </div>
        </Show>
      </div>
      <div class="text-left">{props.children}</div>
    </button>
  );
};

export default Toggle;
