import type { Component } from "solid-js";
import { createResource, createSignal, onMount, createMemo } from "solid-js";
import { algoliasearch } from "algoliasearch";
import Scrollable from "~/components/Scrollable.tsx";
import ResultJourney from "~/components/ResultJourney.tsx";
import ResultPlace from "~/components/ResultPlace.tsx";
import { makeEventListener } from "@solid-primitives/event-listener";
import { navigate } from "astro:transitions/client";
import SearchIcon from "lucide-solid/icons/search";
import ArrowUp from "lucide-solid/icons/arrow-up";
import X from "lucide-solid/icons/x";

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
        { indexName: "places_categories", query: query, hitsPerPage: 10 },
        { indexName: "guides_categories", query: query, hitsPerPage: 10 },
      ],
    });

  const [referrer, setReferrer] = createSignal("");
  const [query, setQuery] = createSignal("");
  const [tab, setTab] = createSignal("places");
  const [response] = createResource(query, search);

  const isSamePage = (e) => {
    const fromUrl = new URL(e.from);
    const toUrl = new URL(e.to);
    fromUrl.search = "";
    toUrl.search = "";
    return fromUrl.href === toUrl.href;
  };

  const setQueryUrl = (url) => {
    setQuery(url.searchParams.get("q"));
  };

  const handleAstroBeforePreparation = (e) => {
    if (isSamePage(e)) e.loader = async () => {};
  };

  const handleAstroBeforeSwap = (e) => {
    if (isSamePage(e)) {
      e.swap = () => {};
      e.viewTransition.skipTransition();
      setQueryUrl(e.to);
    }
  };

  const handleClose = () => {
    const header = document.getElementById("header");
    navigate(header.dataset.previous ?? "/");
  };

  const resultsCount = createMemo(
    () => response()?.results[0]?.nbHits + response()?.results[1]?.nbHits,
  );

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
    <div class="flex w-full max-w-5xl grow flex-col gap-y-4 p-4 xl:max-w-[80%]">
      <div class="flex justify-between gap-x-4">
        <div class="flex flex-col gap-y-4">
          <p class="flex items-center gap-x-2">
            <SearchIcon class="h-5 w-5" />
            <span>
              <Switch fallback="Zadajte hľadaný výraz">
                <Match when={query() && !resultsCount()}>
                  Nenašli sa žiadne výsledky
                </Match>
                <Match when={query() && resultsCount() === 1}>
                  <span>Nájdený {resultsCount()} výsledok</span>
                </Match>
                <Match
                  when={query() && resultsCount() > 1 && resultsCount() < 5}
                >
                  <span>Nájdené {resultsCount()} výsledky</span>
                </Match>
                <Match when={query() && resultsCount() >= 5}>
                  <span>Nájdených {resultsCount()} výsledkov</span>
                </Match>
              </Switch>
            </span>
          </p>
          <div class="text-vibrant-blue flex flex-col gap-y-2">
            <div
              class="flex items-center gap-x-2"
              onClick={() => setTab("places")}
            >
              <ArrowUp
                class="bg-vibrant-blue text-shuttle-white h-4 w-4 rounded-full"
                style={{ transform: `rotate(${90}deg)` }}
              />
              <p
                classList={{ "font-semibold": tab() === "places" }}
                class="lg:font-semibold"
              >
                Miesta ({response()?.results[0]?.nbHits ?? 0})
              </p>
            </div>
            <div
              class="flex items-center gap-x-2"
              onClick={() => setTab("guides")}
            >
              <ArrowUp
                class="bg-vibrant-blue text-shuttle-white h-4 w-4 rounded-full"
                style={{ transform: `rotate(${90}deg)` }}
              />
              <p
                classList={{ "font-semibold": tab() === "guides" }}
                class="lg:font-semibold"
              >
                Návody ({response()?.results[1]?.nbHits ?? 0})
              </p>
            </div>
          </div>
        </div>
        <button
          class={`text-vibrant-blue relative right-[-8px] flex h-8 w-8
            items-center rounded-full border-2 p-1`}
          onClick={handleClose}
        >
          <X class="" />
        </button>
      </div>
      <div class="grid h-full xl:grid-cols-2">
        <div classList={{ hidden: tab() !== "places" }} class="lg:block">
          <Scrollable class="px-6 pt-4 pb-8 md:px-8">
            <div
              class={"mb-8 flex flex-wrap gap-x-4 gap-y-2 overflow-x-clip pt-4"}
            >
              <For each={response()?.results[2]?.hits}>
                {(category) => (
                  <a
                    href={`https://kompasio.sk/app/sk/map/kategoria/${category.alias}`}
                    class={`text-shuttle-white bg-vibrant-blue rounded-full px-2
                    text-sm text-nowrap`}
                  >
                    {category.name}
                  </a>
                )}
              </For>
            </div>

            <div class="flex flex-col gap-y-4">
              <For each={response()?.results[0]?.hits}>
                {(item) => <ResultPlace item={item} />}
              </For>
            </div>
          </Scrollable>
        </div>
        <div classList={{ hidden: tab() !== "guides" }} class="lg:block">
          <Scrollable class="px-6 pt-4 pb-8 md:px-8">
            <div
              class={"mb-8 flex flex-wrap gap-x-4 gap-y-2 overflow-x-clip pt-4"}
            >
              <For each={response()?.results[3]?.hits}>
                {(category) => (
                  <a
                    href={`/navody/${category.slug}`}
                    class={`text-shuttle-white bg-vibrant-blue rounded-full px-2
                    text-sm text-nowrap`}
                  >
                    {category.title}
                  </a>
                )}
              </For>
            </div>

            <div class="flex flex-col gap-y-4">
              <For each={response()?.results[1]?.hits}>
                {(item) => <ResultJourney item={item} />}
              </For>
            </div>
          </Scrollable>
        </div>
      </div>
    </div>
  );
};

export default Search;
