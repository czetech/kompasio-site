import type { Component } from "solid-js";
import { createResource, createSignal } from "solid-js";
import { algoliasearch } from "algoliasearch";
import Scrollable from "~/components/Scrollable.tsx";
import ResultJourney from "~/components/ResultJourney.tsx";
import ResultPlace from "~/components/ResultPlace.tsx";
import ResultPlaceCategory from "~/components/ResultPlaceCategory.tsx";

const Search: Component = (props) => {
  const client = algoliasearch("82UVQ4A8PK", "7ae17487a91af2d6759e1ff809892bb7");

  const search = async (query) =>
    await client.search({
      requests: [
        { indexName: 'places', query: query, hitsPerPage: 100 },
        { indexName: 'guides_journeys', query: query, hitsPerPage: 100 },
        { indexName: "places_categories", query: query, hitsPerPage: 100}],
    });

  const [query, setQuery] = createSignal();
  const [response] = createResource(query, search);

  const handleInput = (event => {
    setQuery(event.currentTarget.value);
  });

  return (
    <div class="flex w-full max-w-5xl grow flex-col gap-y-8 p-8">
      <div class="flex justify-center">
        <input class="border-2 border-vibrant-blue rounded-full px-4" onInput={handleInput} />
      </div>
      <Show when={query()}>
        <div class="grid grid-cols-3 gap-x-16 grow">
          <div>
            <h1 class="flex justify-center text-2xl font-semibold mb-4 gap-x-1">
              <span>Miesta</span>
              <Show when={response()}>
                <span>({response().results[2].nbHits})</span>
              </Show>
            </h1>
            <Show when={response()}>
                <div class="flex flex-col gap-y-4">
                  <For each={response().results[2].hits}>
                    {(item) => (
                      <ResultPlaceCategory item={item} />
                    )}
                  </For>
                </div>
            </Show>
          </div>
          <div>
            <h1 class="flex justify-center text-2xl font-semibold mb-4 gap-x-1">
              <span>Miesta</span>
              <Show when={response()}>
                <span>({response().results[0].nbHits})</span>
              </Show>
            </h1>
            <Show when={response()}>
                <div class="flex flex-col gap-y-4">
                  <For each={response().results[0].hits}>
                    {(item) => (
                      <ResultPlace item={item} />
                    )}
                  </For>
                </div>
            </Show>
          </div>
          <div>
            <h1 class="flex justify-center text-2xl font-semibold mb-4 gap-x-1">
              <span>Návody</span>
              <Show when={response()}>
                <span>({response().results[1].nbHits})</span>
              </Show>
            </h1>
            <Show when={response()}>
                <div class="flex flex-col gap-y-4">
                  <For each={response().results[1].hits}>
                    {(item) => (
                      <ResultJourney item={item} />
                    )}
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
