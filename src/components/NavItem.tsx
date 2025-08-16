import type { Component } from "solid-js";
import { createSignal, onMount, onCleanup } from "solid-js";

const NavItem: Component = (props) => {
  let pathname = props.pathname;

  const external = /^https?:\/\//.test(props.href);

  const evaluateIsActive = () => {
    return props.test
      ? new RegExp(props.test).test(pathname)
      : pathname === props.href;
  };

  const [isActive, setIsActive] = createSignal(evaluateIsActive());

  const handleAfterSwap = () => {
    pathname = window.location.pathname;
    setIsActive(evaluateIsActive());
  };

  onMount(() => {
    document.addEventListener("astro:after-swap", handleAfterSwap);

    onCleanup(() => {
      document.removeEventListener("astro:after-swap", handleAfterSwap);
    });
  });

  return (
    <div
      class={"border-current/50"}
      classList={{ "md:border-r-2": !props.last }}
    >
      <a
        href={props.href}
        target={external ? "_blank" : null}
        class="flex h-8 flex-col justify-center"
        classList={{ "md:pl-4": !props.first, "md:pr-4": !props.last }}
      >
        <span
          classList={{
            "after:content-['_↗']": external,
            "font-semibold": isActive(),
          }}
        >
          {props.title}
        </span>
      </a>
    </div>
  );
};

export default NavItem;
