import { createSignal, For, Show, createMemo, onCleanup, onMount } from 'solid-js';
import type { Component } from 'solid-js';
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
    props.options.find((opt) => opt.id === props.value)
  );

  const handleClickOutside = (e: MouseEvent) => {
    if (selectRef && !selectRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });
  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
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
      class="relative w-full text-vibrant-blue"
      classList={{ '!text-frontier-gray cursor-not-allowed': props.disabled }}
    >
      <button
        type="button"
        onClick={toggleDropdown}
        class="w-full flex items-center p-1 rounded-full border z-20 relative"
        aria-haspopup="listbox"
        aria-expanded={isOpen()}
        disabled={props.disabled}
      >
        <ArrowDown
          class="duration-500"
          classList={{ 'rotate-180': isOpen() }}
        />

        <span class="grow text-lg font-semibold">{selectedOption()?.name || props.label}</span>
      </button>

      <Show when={isOpen()}>
        <div class="absolute z-10 w-full top-0 bg-white border overflow-hidden shadow-lg p-2 rounded-2xl pt-12">
          <ul class="max-h-60 overflow-y-auto space-y-1 pr-2" role="listbox">
            <li
              onClick={() => {
                props.onChange(null);
                setIsOpen(false);
              }}
              role="option"
              class="p-1 text-lg font-semibold text-frontier-gray"
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
                    'bg-vibrant-blue text-white': props.value === option.id,
                    'text-vibrant-blue': props.value !== option.id
                  }}
                  style={{
                    opacity: props.value !== option.id ? 1 - (i() + 1) * 0.1 : 1
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
