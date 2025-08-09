import type { Component } from 'solid-js';
import { createResource, createSignal, Show, For, createMemo } from 'solid-js';
import Select from './Select.tsx';

const fetchLocations = async () => {
  const response = await fetch('/api/locations.json');
  if (!response.ok) throw new Error('Failed to fetch locations');
  return response.json();
};

const fetchPlaces = async (filter: { countyId?: number; districtId?: number; townId?: number; }) => {
  const params = new URLSearchParams();
  if (filter.townId) {
    params.append('townId', String(filter.townId));
  } else if (filter.districtId) {
    params.append('districtId', String(filter.districtId));
  } else if (filter.countyId) {
    params.append('countyId', String(filter.countyId));
  }
  const response = await fetch(`/api/places.json?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch places');
  return response.json();
};

const Places: Component = () => {
  const [locations] = createResource(fetchLocations);

  const [selectedCountyId, setSelectedCountyId] = createSignal<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = createSignal<number | null>(null);
  const [selectedTownId, setSelectedTownId] = createSignal<number | null>(null);

  const availableDistricts = () => {
    const countyId = selectedCountyId();
    if (!countyId || !locations()) return [];
    return locations()!.districts.filter((d) => d.countyId === countyId);
  };

  const availableTowns = () => {
    const districtId = selectedDistrictId();
    if (!districtId || !locations()) return [];
    return locations()!.towns.filter((t) => t.districtId === districtId);
  };

  const handleCountyChange = (id: number | null) => {
    setSelectedCountyId(id);
    setSelectedDistrictId(null);
    setSelectedTownId(null);
  };

  const handleDistrictChange = (id: number | null) => {
    setSelectedDistrictId(id);
    setSelectedTownId(null);
  };

  const handleTownChange = (id: number | null) => {
    setSelectedTownId(id);
  };

  const activeFilter = createMemo(() => {
    const town = selectedTownId();
    if (town) return { townId: town };

    const district = selectedDistrictId();
    if (district) return { districtId: district };

    const county = selectedCountyId();
    if (county) return { countyId: county };

    return {}; // An empty object for no filter
  });

  const [places, { refetch }] = createResource(activeFilter, fetchPlaces);

  return (
    <>
      <div class="p-8">
        <Show when={!locations.loading} fallback={<p>Loading locations...</p>}>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Select
              label="Kraj"
              placeholder="Všetky kraje"
              options={locations()?.counties || []}
              value={selectedCountyId()}
              onChange={handleCountyChange}
              disabled={locations.loading}
            />
            <Select
              label="Okres"
              placeholder="Všetky okresy"
              options={availableDistricts()}
              value={selectedDistrictId()}
              onChange={handleDistrictChange}
              disabled={!selectedCountyId()}
            />
            <Select
              label="Obec"
              placeholder="Všetky obce"
              options={availableTowns()}
              value={selectedTownId()}
              onChange={handleTownChange}
              disabled={!selectedDistrictId()}
            />
          </div>
        </Show>
      </div>

      <Show when={places.loading}><p>Loading...</p></Show>
      <Show when={places.error}>
        <div class="error-message">
          <p>Error fetching data: {places.error.message}</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      </Show>

      <Show when={places()}>
        <div class="flex flex-col gap-y-4">
          <For each={places()}>
            {(place) => (
              <div class="border rounded-2xl text-vibrant-blue p-6">
                <h2 class="text-xl md:text-2xl mb-4">{place.placeName}</h2>
                <div class="mb-2" innerHTML={place.placeShortDescription} />
                <p class="text-sm mb-6">{place.townName}</p>
                <div class="flex flex-wrap gap-2">
                  <For each={place.categoryNames}>
                    {(categoryName) => (
                      <p class="rounded-full bg-vibrant-blue text-white px-2 text-sm py-0.5">{categoryName}</p>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </>
  );
};

export default Places;
