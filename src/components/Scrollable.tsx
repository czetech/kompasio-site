import { createSignal, onMount, onCleanup, createMemo, mergeProps, splitProps } from 'solid-js';
import { createPresence } from "@solid-primitives/presence";

export default function Scrollable(props) {
  const [, otherProps] = splitProps(props, ["class"]);
  
  let componentContainer;
  let scrollableContainer;
  let thumb;

  const borderWidth = 2;

  const [paddingTop, setPaddingTop] = createSignal(0);
  const [paddingRight, setPaddingRight] = createSignal(0);
  const [paddingBottom, setPaddingBottom] = createSignal(0);
  const [paddingLeft, setPaddingLeft] = createSignal(0);
  const [trackSize, setTrackSize] = createSignal(0);
  const [thumbSize, setThumbSize] = createSignal(0);
  const [thumbPosition, setThumbPosition] = createSignal(0);

  const {isVisible, isMounted} = createPresence(thumbPosition, {transitionDuration: 1000,});

  const styleLength = (px) => `${px}px`;

  const paddingTopStyle = createMemo(() => styleLength(paddingTop()));
  const paddingRightStyle = createMemo(() => styleLength(paddingRight()));
  const paddingBottomStyle = createMemo(() => styleLength(paddingBottom()));
  const paddingLeftStyle = createMemo(() => styleLength(paddingLeft()));
  const trackSizeStyle = createMemo(() => styleLength(trackSize()));
  const trackOpacityStyle = createMemo(() => +!isVisible());
  const trackVisibilityStyle = createMemo(() => !isMounted() ? "visible" : "hidden");

  const maskStyle = createMemo(() => {
    if (!paddingTop() && !paddingBottom()) {
      return {};
    }

    const gradient = `linear-gradient(
      to bottom,
      transparent 0,
      black ${paddingTopStyle()},
      black calc(100% - ${paddingBottomStyle()}),
      transparent 100%
    )`;

    return {
      'mask-image': gradient,
      '-webkit-mask-image': gradient,
    };
  });

  const setPosition = () => {
    const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;

    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    setThumbPosition(scrollPercentage * (trackSize() - thumbSize() - (borderWidth * 2)));
  };

  const setSize = () => {
    const { scrollHeight, clientHeight } = scrollableContainer;

    //if (scrollHeight <= clientHeight) {
    //  setThumbSize(0);
    //  return;
    //}

    setTrackSize(clientHeight - paddingTop() - paddingBottom());
    setThumbSize(Math.max(32, clientHeight / scrollHeight * clientHeight));

    setPosition();
  };

  const handleMouseDown = (e) => {
    const thumbRect = thumb.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    if (
      clientX < thumbRect.left ||
      clientX > thumbRect.right ||
      clientY < thumbRect.top ||
      clientY > thumbRect.bottom
    ) { return }

    e.preventDefault();

    const startY = e.clientY;
    const startScrollTop = scrollableContainer.scrollTop;

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const { scrollHeight, clientHeight } = scrollableContainer;

      const scrollRatio = (scrollHeight - clientHeight) / (clientHeight - thumbSize());

      scrollableContainer.scrollTop = startScrollTop + deltaY * scrollRatio;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  onMount(() => {
    const { componentClientHeight: clientHeight } = componentContainer;
    const componentStyle = window.getComputedStyle(componentContainer);
    setPaddingTop(parseFloat(componentStyle.paddingTop));
    setPaddingRight(parseFloat(componentStyle.paddingRight));
    setPaddingBottom(parseFloat(componentStyle.paddingBottom));
    setPaddingLeft(parseFloat(componentStyle.paddingLeft));

    setSize();

    window.addEventListener('resize', setSize);
    scrollableContainer.addEventListener('scroll', setPosition);

    onCleanup(() => {
      window.removeEventListener('resize', setSize);
      scrollableContainer.removeEventListener('scroll', setPosition);
    });
  });

  return (
    <div ref={componentContainer} class="relative h-full" classList={{[props.class]: props.class}} style={{"--padding-right": paddingRightStyle(), "--track-opacity": trackOpacityStyle(), "--track-visibility": trackVisibilityStyle()}} onMouseDown={handleMouseDown} {...otherProps}>
      <div ref={scrollableContainer} class="absolute top-0 left-0 w-full h-full overflow-y-auto scrollbar-hide pr-(--padding-right) md:pr-[calc(var(--padding-right)_+_(var(--spacing)_*_20))]" style={{"padding-top": paddingTopStyle(), "padding-bottom": paddingBottomStyle(), "padding-left": paddingLeftStyle(), ...maskStyle()}}>{props.children}</div>
      <div class="absolute w-4 rounded-full bg-white text-vibrant-blue flex-none right-0 md:right-(--padding-right) opacity-(--track-opacity) md:opacity-100 transition-opacity duration-1000 pointer-events-none" style={{top: paddingTopStyle(), "border-width": `${borderWidth}px`, height: trackSizeStyle()}}>
        <div ref={thumb}
            class="absolute w-[12px] rounded-full cursor-pointer bg-current"
            style={{
              height: `${thumbSize()}px`,
              top: `${thumbPosition()}px`,
            }}
        />
      </div>
    </div>
  );
}
