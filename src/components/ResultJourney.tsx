import type { Component } from "solid-js";

const ResultJourney: Component = (props) => {

  const hitDescription = props.item._highlightResult.descriptionHtml?.find(item => item.matchLevel !== "none");
  const hitStepTitle = props.item._highlightResult.steps.find(item => item.title.matchLevel !== "none")?.title;
  let hitStepBody;
  for (const step of props.item._highlightResult.steps) {
    hitStepBody = step.bodyHtml.find(item => item.matchLevel !== "none");
    if (hitStepBody) break;
  }

  return (
    <div class="text-vibrant-blue rounded-3xl border p-6">
      <h2 class="mb-4 text-2xl" innerHTML={props.item._highlightResult.title.value} />
      <div class="mb-8">
        <For each={props.item._highlightResult.descriptionHtml}>
          {(paragraph) => (
            <div innerHTML={paragraph.value} />
          )}
        </For>
      </div>
      <Show when={hitStepTitle && !(props.item._highlightResult.title.matchLevel !== "none") && !hitDescription}>
        <div class="text-lg" innerHTML={hitStepTitle.value} />
        <span class="text-red-orange">[názov kroku]</span>
      </Show>
      <Show when={hitStepBody && !(props.item._highlightResult.title.matchLevel !== "none") && !hitDescription && !hitStepTitle}>
        <div innerHTML={hitStepBody.value} />
        <span class="text-red-orange">[útržok z textu kroku]</span>
      </Show>
      <div class="flex pt-4">
        <p class="text-shuttle-white bg-vibrant-blue text-sm px-2 rounded-full">{props.item.category}</p>
      </div>
    </div>
  );
};

export default ResultJourney;
