import { createSignal, createEffect } from 'solid-js';

const Toggle = (props) => {
  const handleClick = () => {
    props.onSet(!props.checked);
  };

  return (
    <button onClick={handleClick} class="text-vibrant-blue flex items-center gap-x-2">
      <div class="relative pr-1 h-5 border-2 rounded-full duration-200 focus:outline-none flex items-center flex-none" classList={{"bg-current": props.checked, "w-13": props.note != null, "w-9": props.note == null}}>
        <div
          class="h-5 w-5 relative left-[-2px] rounded-full duration-200 border-2 flex-none"
          classList={{"bg-shuttle-white": props.checked, "translate-x-8": props.checked && props.note != null, "translate-x-4": props.checked && props.note == null}}
        />
        <Show when={props.note != null && !props.checked}>
          <div class="flex-grow flex justify-center items-center text-sm">{props.note}</div>
        </Show>
      </div>
      <div class="text-left">
        {props.children}
      </div>
    </button>
  );
};

export default Toggle;
