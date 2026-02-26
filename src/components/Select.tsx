import {
  createSignal,
  For,
  Show,
  createMemo,
  onCleanup,
  onMount,
  createEffect,
} from "solid-js";
import type { Component } from "solid-js";
import ArrowDown from "lucide-solid/icons/arrow-down";
import Eraser from "lucide-solid/icons/eraser";
import X from "lucide-solid/icons/x";
import Scrollable from "~/components/Scrollable.tsx";

const Select: Component<StyledSelectProps> = (props) => {
  let componentRef;

  const [isOpen, setIsOpen] = createSignal();
  const [selected, setSelected] = createSignal();
  const [search, setSearch] = createSignal("");

  const handleClickOutside = (e: MouseEvent) => {
    if (componentRef && !componentRef.contains(e.target as Node)) {
      setIsOpen(false);
      setSearch("");
    }
  };

  const handleSelect = (value) => {
    setSelected(value);
    setIsOpen(false);
    setSearch("");
  };

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);

    onCleanup(() => {
      document.removeEventListener("mousedown", handleClickOutside);
    });
  });

  createEffect(() => {
    props.onSearch(search());
  });

  createEffect(() => {
    props.onSelect(selected());
  });

  createEffect(() => {
    if (props.disabled) {
      setSelected();
    }
  });

  const selectedName = createMemo(() =>
    selected()
      ? (props.options.find((option) => option.id === selected())?.name ?? "")
      : props.placeholder,
  );

  return (
    <div
      ref={componentRef}
      class="text-vibrant-blue relative"
      classList={{ "!text-frontier-gray": props.disabled }}
    >
      <button
        onClick={() => setIsOpen(!isOpen())}
        class={`relative flex w-full items-center rounded-full border-2 py-1
          pr-8 pl-1`}
        classList={{ "z-110": isOpen(), "z-10": !isOpen() }}
        disabled={props.disabled}
      >
        <ArrowDown
          class="flex-none duration-500"
          classList={{ "rotate-180": isOpen() }}
        />

        <span class="grow truncate pl-2" innerHTML={selectedName()} />
      </button>
      <button
        class="absolute top-0 right-0.5 p-1.5"
        onClick={() => {
          setSelected();
          setIsOpen(false);
        }}
        classList={{ "z-120": isOpen(), "z-20": !isOpen() }}
      >
        <X />
      </button>
      <Show when={isOpen()}>
        <div
          class={`absolute top-0 z-100 h-90 w-full overflow-hidden rounded-2xl
            border-x-2 border-b-2 bg-white pt-12 text-sm shadow-lg`}
        >
          <div class="mx-3 flex gap-x-2 border-b-2">
            <input
              class={`placeholder:text-frontier-gray w-full text-base
                font-semibold placeholder:text-sm focus:outline-none`}
              placeholder={props.searchPlaceholder}
              onInput={(event) => setSearch(event.target.value)}
              value={search()}
            />
            <button class="h-full px-2" onClick={() => setSearch("")}>
              <Eraser class="relative bottom-[calc(var(--spacing)_*_-1)]" />
            </button>
          </div>
          <Scrollable paddingTrack={8} class="px-2 pt-3 pb-16">
            <ul class="space-y-1 pr-2" role="listbox">
              <For each={props.options}>
                {(option) => (
                  <li
                    class="p-1 pl-[calc(var(--spacing)_*_var(--indent)_*_3)]"
                    classList={{
                      "bg-vibrant-blue text-white rounded-full pl-6 duration-200":
                        selected() === option.id,
                    }}
                    style={{ "--indent": option.indent }}
                    onClick={() => handleSelect(option.id)}
                    innerHTML={option.name}
                  />
                )}
              </For>
            </ul>
          </Scrollable>
        </div>
      </Show>
    </div>
  );
};

export default Select;
