import type { Component } from "solid-js";

const ResultPlace: Component = (props) => {

  const hitDescription = props.item._highlightResult.descriptionHtml?.find(item => item.matchLevel !== "none");
  const hitShortDescription = props.item._highlightResult.shortDescriptionHtml?.find(item => item.matchLevel !== "none");

  return (
    <div class="bg-vibrant-blue rounded-3xl pt-32 relative">
    <div class="text-vibrant-blue rounded-3xl border p-6 bg-shuttle-white">
      <h2 class="text-xl font-semibold" innerHTML={props.item._highlightResult.name.value} />
      <p class="mb-4" innerHTML={props.item._highlightResult.town.name.value} />
      <div class="mb-8">
        <For each={props.item._highlightResult.shortDescriptionHtml}>
          {(paragraph) => (
            <div innerHTML={paragraph.value} />
          )}
        </For>
      </div>
      <Show when={hitDescription && !(props.item._highlightResult.name.matchLevel !== "none") && !hitShortDescription}>
        <div innerHTML={hitDescription.value} />
        <span class="text-red-orange">[útržok z popisu miesta]</span>
      </Show>
    </div>
    </div>
  );
};

export default ResultPlace;
