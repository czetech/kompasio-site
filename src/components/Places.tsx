import type { Component } from "solid-js";
import {
  createResource,
  createSignal,
  Show,
  For,
  on,
  createMemo,
  createEffect,
} from "solid-js";
import Select from "./Select.tsx";
import { algoliasearch } from "algoliasearch";
import Scrollable from "~/components/Scrollable.tsx";
import ResultPlace from "~/components/ResultPlace.tsx";
import { createStore, produce, unwrap, reconcile } from "solid-js/store";
import Toggle from "~/components/Toggle.tsx";
import ArrowDown from "lucide-solid/icons/arrow-down";
import X from "lucide-solid/icons/x";
import Map from "~/components/Map.tsx";

const Places: Component = (props) => {
  const client = algoliasearch(
    "82UVQ4A8PK",
    "37acde64117de3642969c17f1b3380cb",
  );
  const facets = Object.keys(props.parameters).map(
    (parameterId) => `parameters.${parameterId}`,
  );

  const browsePlaces = async (cursor) =>
    await client.browse({
      indexName: "places",
      browseParams: {
        attributesToRetrieve: ["name", "shortDescriptionHtml", "_geoloc"],
        cursor: cursor,
      },
    });

  const searchPlaces = async ({ query, filters, hitsPerPage = 1000 }) => {
    return await client.searchSingleIndex({
      indexName: "places",
      searchParams: {
        attributesToRetrieve: ["categories.name", "_geoloc"],
        facets: facets,
        filters: filters,
        hitsPerPage: hitsPerPage,
        query: query,
      },
    });
  };

  const searchCategories = async (query) =>
    await client.searchSingleIndex({
      indexName: "places_categories",
      searchParams: {
        attributesToRetrieve: ["alias", "name"],
        hitsPerPage: 1000,
        query: query,
      },
    });

  const searchLocations = async (query) =>
    await client.searchSingleIndex({
      indexName: "locations",
      searchParams: {
        attributesToRetrieve: ["code", "name", "type"],
        hitsPerPage: 1000,
        query: query,
      },
    });

  const [browsePlacesCursor, setBrowsePlacesCursor] = createSignal("");
  const [placeQuery, setPlaceQuery] = createSignal();
  const [categoryQuery, setCategoryQuery] = createSignal("");
  const [locationQuery, setLocationQuery] = createSignal("");
  const [selectedCategory, setSelectedCategory] = createSignal();
  const [selectedLocation, setSelectedLocation] = createSignal();
  const [isOnline, setIsOnline] = createSignal();
  const [selectedParameters, setSelectedParameters] = createStore({});
  const [categoryFacets, setCategoryFacets] = createStore({});
  const [isParametersOpen, setIsParametersOpen] = createSignal(false);
  const [expandedParameters, setExpandedParameters] = createStore({});
  const [allPlaces, setAllPlaces] = createStore([]);
  const [places, setPlaces] = createStore([]);

  const placeSearchParams = createMemo(() => {
    const filters = [];
    if (selectedCategory()) {
      filters.push(`categories.alias:${selectedCategory()}`);
    }
    if (selectedLocation()) {
      const code = selectedLocation();
      if (code.length === 1) {
        filters.push(`county.code:${code}`);
      }
      if (code.length === 3) {
        filters.push(`district.code:${code}`);
      }
      if (code.length === 6) {
        filters.push(`town.code:${code}`);
      }
    }
    if (isOnline()) {
      filters.push("county.name:ON-LINE");
    }

    Object.keys(selectedParameters)
      .sort()
      .forEach((parameterId) => {
        const optionsIds = selectedParameters[parameterId];
        if (optionsIds?.length) {
          const optionsFilters = optionsIds
            .map((optionId) => `parameters.${parameterId}:${optionId}`)
            .join(" OR ");
          filters.push(`(${optionsFilters})`);
        }
      });

    return { query: placeQuery(), filters: filters.join(" AND ") };
  });

  const categoryFilter = createMemo(() => {
    setIsParametersOpen(false);
    if (selectedCategory()) {
      return `categories.alias:${selectedCategory()}`;
    } else {
      return null;
    }
  });

  const [browsePlacesResponse] = createResource(
    browsePlacesCursor,
    browsePlaces,
  );
  const [placesResponse] = createResource(placeSearchParams, searchPlaces);
  const [categoriesResponse] = createResource(categoryQuery, searchCategories);
  const [locationsResponse] = createResource(locationQuery, searchLocations);
  const [categoryPlacesResponse, { mutate: categoryPlacesMutate }] =
    createResource(() => {
      if (categoryFilter() !== null) {
        return { filters: categoryFilter(), hitsPerPage: 0 };
      } else {
        return null;
      }
    }, searchPlaces);

  createEffect(() => {
    if (!selectedCategory()) {
      categoryPlacesMutate(undefined);
    }
  });

  createEffect(
    on(
      browsePlacesResponse,
      (response) => {
        setAllPlaces((allPlaces) => [...allPlaces, ...response.hits]);
        setBrowsePlacesCursor(browsePlacesResponse().cursor);
      },
      { defer: true },
    ),
  );

  createEffect(
    on(
      placesResponse,
      (response) => {
        if (placeSearchParams().query || placeSearchParams().filters) {
          setPlaces(placesResponse().hits);
        } else {
          setPlaces(allPlaces);
        }
      },
      { defer: true },
    ),
  );

  const categories = createMemo(() => {
    return categoriesResponse() !== undefined
      ? categoriesResponse().hits.map((category) => ({
          id: category.alias,
          name: category._highlightResult.name.value,
        }))
      : [];
  });

  const locations = createMemo(() => {
    return locationsResponse() !== undefined
      ? locationsResponse().hits.map((location) => ({
          id: location.code,
          name: location._highlightResult.name.value,
          indent: { county: 0, district: 1, town: 2 }[location.type],
        }))
      : [];
  });

  createEffect(() => {
    selectedCategory();
    setSelectedParameters(reconcile({}));
    setCategoryFacets(reconcile({}));
  });

  const handleSetParameter = (parameterId, optionId, value, multi) => {
    setSelectedParameters(
      produce((selectedParameters) => {
        selectedParameters[parameterId] ??= [];
        if (value) {
          if (!selectedParameters[parameterId].includes(optionId)) {
            if (multi) {
              selectedParameters[parameterId].push(optionId);
            } else {
              selectedParameters[parameterId] = [optionId];
            }
          }
        } else {
          selectedParameters[parameterId] = selectedParameters[
            parameterId
          ].filter((parameterOptionId) => parameterOptionId !== optionId);
        }
        if (selectedParameters[parameterId].length === 0) {
          selectedParameters[parameterId] = undefined;
        }
      }),
    );
  };

  return (
    <div class="grid w-full grow grid-cols-2 xl:grid-cols-2">
      <Scrollable client:only class="px-8 pt-8 pb-16" paddingTrack={12}>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="w-full md:max-w-64">
            <Select
              placeholder="Kategória"
              searchPlaceholder="Vyhľadať kategóriu"
              options={categories()}
              onSearch={setCategoryQuery}
              onSelect={setSelectedCategory}
            />
          </div>
          <div class="flex w-full flex-col gap-y-2 md:max-w-64">
            <Select
              placeholder="Mesto"
              searchPlaceholder="Vyhľadať mesto"
              options={locations()}
              onSearch={setLocationQuery}
              onSelect={setSelectedLocation}
              disabled={isOnline()}
            />
            <div class="flex items-center gap-x-2">
              <Toggle onSet={setIsOnline} checked={isOnline()}>
                On-line miesta
              </Toggle>
            </div>
          </div>
          <div class="w-full md:max-w-64">
            <input
              class={`text-shuttle-white bg-vibrant-blue h-9 w-full rounded-full
                px-4 focus:outline-none`}
              placeholder="Hľadať"
              onInput={(event) => setPlaceQuery(event.target.value)}
            />
          </div>
        </div>
        <div class="mt-4 font-semibold">
          Nájdených {placesResponse()?.nbHits} výsledkov
        </div>
        <div class="border-vibrant-blue mt-4 rounded-3xl border-2 px-2 py-2">
          <Show
            when={selectedCategory()}
            fallback={
              <span class="ml-2">
                Pre filtrovanie podľa parametrov najskôr vyberte kategóriu.
              </span>
            }
          >
            <div class="flex justify-between gap-x-8">
              <button
                class="text-vibrant-blue flex gap-x-2"
                onClick={() => {
                  setIsParametersOpen(!isParametersOpen());
                  setExpandedParameters(reconcile({}));
                }}
              >
                <ArrowDown
                  class="flex-none duration-500"
                  classList={{ "rotate-180": isParametersOpen() }}
                />
                <Show when={!isParametersOpen()} fallback={<p>Skryť filter</p>}>
                  <Show
                    when={Object.keys(selectedParameters).length}
                    fallback={<p>Zobraziť filter</p>}
                  >
                    <p class="font-semibold">Zobraziť aktívne filtre</p>
                  </Show>
                </Show>
              </button>
              <Show when={Object.keys(selectedParameters).length}>
                <button
                  class="text-vibrant-blue flex gap-x-2"
                  onClick={() => setSelectedParameters(reconcile({}))}
                >
                  <X />
                  <p>Zrušiť filter</p>
                </button>
              </Show>
            </div>
            <Show when={isParametersOpen()}>
              <div class="mt-4 flex flex-col gap-y-4">
                <For
                  each={
                    places && Object.entries(categoryPlacesResponse().facets)
                  }
                >
                  {([facet, options]) => {
                    const parameterId = parseInt(facet.split(".")[1]);
                    return (
                      <div>
                        <div class="flex gap-x-2">
                          <p class="mb-1 font-semibold">
                            {props.parameters[parameterId].name}:
                          </p>
                          <p class="text-sm">
                            {props.parameters[parameterId].type === "select"
                              ? "Len 1"
                              : "Viac"}
                          </p>
                        </div>
                        <div class="flex flex-wrap gap-x-6 gap-y-2">
                          <For each={Object.entries(options)}>
                            {([option, count], index) => {
                              const optionId = parseInt(option);
                              const multi =
                                props.parameters[parameterId].type !== "select";
                              const realCount = () => {
                                if (!selectedParameters[parameterId]?.length) {
                                  return (
                                    placesResponse().facets[facet]?.[option] ??
                                    0
                                  );
                                } else {
                                  return multi ? "+" : "";
                                }
                              };
                              return (
                                <Show
                                  when={
                                    index() < 5 ||
                                    expandedParameters[parameterId]
                                  }
                                >
                                  <div
                                    classList={{
                                      "opacity-50": realCount() === 0,
                                    }}
                                  >
                                    <Toggle
                                      onSet={(value) =>
                                        handleSetParameter(
                                          parameterId,
                                          optionId,
                                          value,
                                          multi,
                                        )
                                      }
                                      checked={selectedParameters[
                                        parameterId
                                      ]?.includes(optionId)}
                                      note={realCount()}
                                    >
                                      {props.options[optionId]?.name}
                                    </Toggle>
                                  </div>
                                </Show>
                              );
                            }}
                          </For>
                          <Show when={Object.keys(options).length > 5}>
                            <button
                              class="text-vibrant-blue font-semibold"
                              onClick={() =>
                                setExpandedParameters(
                                  parameterId,
                                  !expandedParameters[parameterId],
                                )
                              }
                            >
                              ..zobraziť{" "}
                              {expandedParameters[parameterId]
                                ? "menej"
                                : "všetky"}
                            </button>
                          </Show>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>
        </div>
        <div class="grid max-w-xl grid-cols-1 gap-8 py-8 md:grid-cols-2">
          <For each={places}>
            {(item) => (
              <div class="flex flex-col">
                <ResultPlace item={item} />
              </div>
            )}
          </For>
        </div>
      </Scrollable>
      <div
        class=".invisible xl:visible"
        classList={{ "opacity-33": isOnline() }}
      >
        <Map places={places.filter((hit) => hit._geoloc)} />
      </div>
    </div>
  );
};

export default Places;
