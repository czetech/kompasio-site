import { createSignal, onMount, onCleanup, createMemo } from "solid-js";
import { createPresence } from "@solid-primitives/presence";
import { createStore, produce } from "solid-js/store";
import { makeEventListener } from "@solid-primitives/event-listener";
import { makeResizeObserver } from "@solid-primitives/resize-observer";

export default function Scrollable(props) {
  let componentRef;
  let scrollableRef;
  let trackRef;
  let thumbRef;

  const borderWidth = 2;

  const [scrollable, setScrollable] = createStore({
    clientHeight: 0,
    scrollHeight: 0,
  });
  const [padding, setPadding] = createStore({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [scroll, setScroll] = createSignal(0);

  const trackSize = createMemo(() => {
    return scrollable.clientHeight - padding.top - padding.bottom;
  });

  const thumbSize = createMemo(() => {
    const viewableRatio = scrollable.clientHeight / scrollable.scrollHeight;
    return Math.max(32, viewableRatio * scrollable.clientHeight);
  });

  const thumbPosition = createMemo(() => {
    const scrollPercentage =
      scroll() / (scrollable.scrollHeight - scrollable.clientHeight);
    return scrollPercentage * (trackSize() - thumbSize() - borderWidth * 2);
  });

  const { isVisible } = createPresence(thumbPosition, {
    transitionDuration: 500,
  });

  const paddingTopStyle = createMemo(() => `${padding.top}px`);
  const paddingRightStyle = createMemo(() => `${padding.right}px`);
  const paddingBottomStyle = createMemo(() => `${padding.bottom}px`);
  const paddingLeftStyle = createMemo(() => `${padding.left}px`);
  const trackSizeStyle = createMemo(() => `${trackSize()}px`);
  const trackOpacityStyle = createMemo(() => (isVisible() ? "0.2" : "1"));
  const thumbSizeStyle = createMemo(() => `${thumbSize()}px`);
  const thumbPositionTranslate = createMemo(
    () => `translateY(${thumbPosition()}px)`,
  );

  const maskStyle = createMemo(
    () => `linear-gradient(
      to bottom,
      transparent 0,
      black ${paddingTopStyle()},
      black calc(100% - ${paddingBottomStyle()}),
      transparent 100%
    )`,
  );

  const handlePointerdown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const clientX = e.clientX;
    const clientY = e.clientY;
    const trackRect = trackRef.getBoundingClientRect();
    if (
      clientY < trackRect.top ||
      clientX > trackRect.right ||
      clientY > trackRect.bottom ||
      clientX < trackRect.left
    )
      return;

    e.preventDefault();

    let startScroll;
    const thumbRect = thumbRef.getBoundingClientRect();
    if (clientY < thumbRect.top || clientY > thumbRect.bottom) {
      const clickYOnTrack = e.clientY - trackRect.top;
      const thumbTravelDistance = trackSize() - thumbSize() - borderWidth * 2;
      if (thumbTravelDistance <= 0) return;
      const targetThumbY = clickYOnTrack - thumbSize() / 2;
      const scrollPercentage = targetThumbY / thumbTravelDistance;
      const maxScrollTop = scrollable.scrollHeight - scrollable.clientHeight;
      startScroll = Math.max(
        0,
        Math.min(scrollPercentage * maxScrollTop, maxScrollTop),
      );
      scrollableRef.scrollTop = startScroll;
    } else {
      startScroll = scroll();
    }

    const handleTouchmove = (moveEvent) => {
      moveEvent.preventDefault();
    };

    const handlePointermove = (moveEvent) => {
      const deltaY = moveEvent.clientY - clientY;
      const scrollRatio =
        (scrollable.scrollHeight - scrollable.clientHeight) /
        (trackSize() - thumbSize());
      scrollableRef.scrollTop = startScroll + deltaY * scrollRatio;
    };

    const handlePointerup = () => {
      clearTouchmove();
      clearPointermove();
      clearPointerup();
    };

    const clearTouchmove = makeEventListener(
      document,
      "touchmove",
      handleTouchmove,
      { passive: false },
    );
    const clearPointermove = makeEventListener(
      document,
      "pointermove",
      handlePointermove,
      { passive: true },
    );
    const clearPointerup = makeEventListener(
      document,
      "pointerup",
      handlePointerup,
      {
        passive: true,
      },
    );
  };

  const handleResizeObserver = () => {
    setScrollable(
      produce((scrollable) => {
        scrollable.clientHeight = scrollableRef.clientHeight;
        scrollable.scrollHeight = scrollableRef.scrollHeight;
      }),
    );
  };

  const handleScroll = () => {
    setScroll(scrollableRef.scrollTop);
  };

  onMount(() => {
    setPadding(
      produce((padding) => {
        const componentStyle = window.getComputedStyle(componentRef);
        padding.top = parseFloat(componentStyle.paddingTop);
        padding.right = parseFloat(componentStyle.paddingRight);
        padding.bottom = parseFloat(componentStyle.paddingBottom);
        padding.left = parseFloat(componentStyle.paddingLeft);
      }),
    );

    makeEventListener(componentRef, "pointerdown", handlePointerdown);
    makeResizeObserver(handleResizeObserver).observe(scrollableRef);
    makeEventListener(scrollableRef, "scroll", handleScroll, { passive: true });
  });

  return (
    <div
      ref={componentRef}
      class="relative h-full"
      classList={{ [props.class]: props.class }}
      style={{
        "--padding-right": paddingRightStyle(),
        "--track-opacity": trackOpacityStyle(),
      }}
    >
      <div
        ref={scrollableRef}
        class={`scrollbar-hide absolute top-0 left-0 h-full w-full
          overflow-y-auto pr-(--padding-right)
          md:pr-[calc(var(--padding-right)_+_(var(--spacing)_*_20))]`}
        style={{
          "padding-top": paddingTopStyle(),
          "padding-bottom": paddingBottomStyle(),
          "padding-left": paddingLeftStyle(),
          "mask-image": maskStyle(),
          "-webkit-mask-image": maskStyle(),
        }}
      >
        {props.children}
      </div>
      <div
        ref={trackRef}
        class={`text-vibrant-blue pointer-events-none absolute right-0 w-4
          flex-none rounded-full bg-white opacity-(--track-opacity)
          transition-opacity duration-1000 md:right-(--padding-right)
          md:opacity-100`}
        style={{
          top: paddingTopStyle(),
          "border-width": `${borderWidth}px`,
          height: trackSizeStyle(),
        }}
      >
        <div
          ref={thumbRef}
          class="absolute w-[12px] cursor-pointer rounded-full bg-current"
          style={{
            height: thumbSizeStyle(),
            transform: thumbPositionTranslate(),
          }}
        />
      </div>
    </div>
  );
}
