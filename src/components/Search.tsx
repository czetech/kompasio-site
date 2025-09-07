import type { Component } from "solid-js";
import { createResource, createSignal, onMount } from "solid-js";
import { algoliasearch } from "algoliasearch";
import Scrollable from "~/components/Scrollable.tsx";
import ResultJourney from "~/components/ResultJourney.tsx";
import ResultPlace from "~/components/ResultPlace.tsx";
import ResultPlaceCategory from "~/components/ResultPlaceCategory.tsx";
import { makeEventListener } from "@solid-primitives/event-listener";
import { navigate } from "astro:transitions/client";

const Search: Component = (props) => {
  const client = algoliasearch(
    "82UVQ4A8PK",
    "7ae17487a91af2d6759e1ff809892bb7",
  );

  const search = async (query) =>
    await client.search({
      requests: [
        { indexName: "places", query: query, hitsPerPage: 100 },
        { indexName: "guides_journeys", query: query, hitsPerPage: 100 },
        { indexName: "places_categories", query: query, hitsPerPage: 100 },
      ],
    });

  const [query, setQuery] = createSignal();
  const [response] = createResource(query, search);

  const isQueryNavigation = (e) => {
    const fromUrl = new URL(e.from);
    const toUrl = new URL(e.to);
    fromUrl.searchParams.delete("q");
    toUrl.searchParams.delete("q");
    return fromUrl.href === toUrl.href;
  };

  const setQueryUrl = (url) => {
    setQuery(url.searchParams.get("q"));
  };

  const handleInput = (event) => {
    setQuery(event.currentTarget.value);
  };

  const handleAstroBeforePreparation = (e) => {
    if (isQueryNavigation(e)) e.loader = async () => {};
  };

  const handleAstroBeforeSwap = (e) => {
    if (isQueryNavigation(e)) {
      e.swap = () => {};
      e.viewTransition.skipTransition();
      setQueryUrl(e.to);
    }
  };

  onMount(() => {
    makeEventListener(
      document,
      "astro:before-preparation",
      handleAstroBeforePreparation,
    );
    makeEventListener(document, "astro:before-swap", handleAstroBeforeSwap);

    setQueryUrl(new URL(window.location.href));
  });

  return (
    <div class="flex w-full max-w-5xl grow flex-col gap-y-8 p-8">
      <Show when={query()}>
        <div class="grid grow grid-cols-3 gap-x-16">
          <div>
            <h1 class="mb-4 flex justify-center gap-x-1 text-2xl font-semibold">
              <span>Kategórie</span>
              <Show when={response()}>
                <span>({response().results[2].nbHits})</span>
              </Show>
            </h1>
            <Show when={response()}>
              <div class="flex flex-col gap-y-4">
                <For each={response().results[2].hits}>
                  {(item) => <ResultPlaceCategory item={item} />}
                </For>
              </div>
            </Show>
          </div>
          <div>
            <h1 class="mb-4 flex justify-center gap-x-1 text-2xl font-semibold">
              <span>Miesta</span>
              <Show when={response()}>
                <span>({response().results[0].nbHits})</span>
              </Show>
            </h1>
            <Show when={response()}>
              <div class="flex flex-col gap-y-4">
                <For each={response().results[0].hits}>
                  {(item) => <ResultPlace item={item} />}
                </For>
              </div>
            </Show>
          </div>
          <div>
            <h1 class="mb-4 flex justify-center gap-x-1 text-2xl font-semibold">
              <span>Návody</span>
              <Show when={response()}>
                <span>({response().results[1].nbHits})</span>
              </Show>
            </h1>
            <Show when={response()}>
              <div class="flex flex-col gap-y-4">
                <For each={response().results[1].hits}>
                  {(item) => <ResultJourney item={item} />}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Search;
