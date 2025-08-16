import {
  createSignal,
  For,
  Show,
  createMemo,
  onCleanup,
  onMount,
} from "solid-js";
import type { Component } from "solid-js";
import ArrowDown from "lucide-solid/icons/arrow-down";

interface Option {
  id: number;
  name: string;
}

interface StyledSelectProps {
  options: Option[];
  value: number | null;
  onChange: (selectedId: number | null) => void;
  label: string;
  placeholder: string;
  disabled?: boolean;
}

const Select: Component<StyledSelectProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let selectRef: HTMLDivElement | undefined;

  const selectedOption = createMemo(() =>
    props.options.find((opt) => opt.id === props.value),
  );

  const handleClickOutside = (e: MouseEvent) => {
    if (selectRef && !selectRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });
  onCleanup(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });

  const toggleDropdown = () => {
    if (!props.disabled) {
      setIsOpen(!isOpen());
    }
  };

  const handleSelect = (option: Option) => {
    props.onChange(option.id);
    setIsOpen(false);
  };

  return (
    <div
      ref={selectRef}
      class="text-vibrant-blue relative w-full"
      classList={{ "!text-frontier-gray cursor-not-allowed": props.disabled }}
    >
      <button
        type="button"
        onClick={toggleDropdown}
        class="relative z-20 flex w-full items-center rounded-full border p-1"
        aria-haspopup="listbox"
        aria-expanded={isOpen()}
        disabled={props.disabled}
      >
        <ArrowDown
          class="duration-500"
          classList={{ "rotate-180": isOpen() }}
        />

        <span class="grow text-lg font-semibold">
          {selectedOption()?.name || props.label}
        </span>
      </button>

      <Show when={isOpen()}>
        <div
          class={`absolute top-0 z-10 w-full overflow-hidden rounded-2xl border
            bg-white p-2 pt-12 shadow-lg`}
        >
          <ul class="max-h-60 space-y-1 overflow-y-auto pr-2" role="listbox">
            <li
              onClick={() => {
                props.onChange(null);
                setIsOpen(false);
              }}
              role="option"
              class="text-frontier-gray p-1 text-lg font-semibold"
            >
              {props.placeholder}
            </li>
            <For each={props.options}>
              {(option, i) => (
                <li
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={option.id === props.value}
                  class="p-1 text-xl font-semibold"
                  classList={{
                    "bg-vibrant-blue text-white": props.value === option.id,
                    "text-vibrant-blue": props.value !== option.id,
                  }}
                  style={{
                    opacity:
                      props.value !== option.id ? 1 - (i() + 1) * 0.1 : 1,
                  }}
                >
                  {option.name}
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
};

export default Select;
