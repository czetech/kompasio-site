import type { Component } from "solid-js";

const ResultPlaceCategory: Component = (props) => {

  const hitDescription = props.item._highlightResult.descriptionHtml?.find(item => item.matchLevel !== "none");

  return (
    <div class="text-vibrant-blue rounded-3xl border p-6">
      <div class="flex pt-4">
        <p class="text-shuttle-white bg-vibrant-blue text-sm px-2 rounded-full" innerHTML={props.item._highlightResult.name.value} />
      </div>
      <Show when={hitDescription && !(props.item._highlightResult.name.matchLevel !== "none")}>
        <div innerHTML={hitDescription.value} />
        <span class="text-red-orange">[útržok z popisu miesta]</span>
      </Show>
    </div>
  );
};

export default ResultPlaceCategory;
