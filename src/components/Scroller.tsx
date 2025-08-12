import { createSignal, onMount, onCleanup } from 'solid-js';

export default function Scroller({ scrollContainerId }) {
  const [thumbHeight, setThumbHeight] = createSignal(0);
  const [thumbTop, setThumbTop] = createSignal(0);
  let scrollContainer;

  const handleScroll = () => {
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    const newThumbTop = scrollPercentage * (clientHeight - thumbHeight());

    setThumbTop(newThumbTop);
  };

  onMount(() => {
    scrollContainer = document.getElementById(scrollContainerId);
    if (scrollContainer) {
      const { scrollHeight, clientHeight } = scrollContainer;
      const newThumbHeight = (clientHeight / scrollHeight) * clientHeight;
      setThumbHeight(newThumbHeight);

      scrollContainer.addEventListener('scroll', handleScroll);
    }
  });

  onCleanup(() => {
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', handleScroll);
    }
  });

  return (
    <div class="absolute top-0 right-0 h-full w-2">
      <div
        class="absolute w-full bg-blue-500 rounded-full"
        style={{
          height: `${thumbHeight()}px`,
          top: `${thumbTop()}px`,
          transition: 'top 0.1s linear'
        }}
      />
    </div>
  );
}
