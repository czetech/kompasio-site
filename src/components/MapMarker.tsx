import { onMount, createEffect, onCleanup, on, createSignal } from "solid-js";
import ResultPlace from "~/components/ResultPlace.tsx";
import MapPin from "lucide-solid/icons/map-pin";

function MapMarker(props) {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div
      onClick={() => setIsOpen(!isOpen())}
      class="flex flex-col items-center"
      classList={{ "relative z-1000": isOpen() }}
    >
      <Show when={isOpen()}>
        <div class="relative top-6 w-48 text-base">
          <ResultPlace item={props.item} />
        </div>
      </Show>
      <MapPin class="text-vibrant-blue fill-vibrant-blue/33 h-8 w-8" />
    </div>
  );
}

export default MapMarker;
