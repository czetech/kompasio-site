import type { Component } from "solid-js";

const ResultPlace: Component = (props) => {
  const hitDescription = props.item._highlightResult?.descriptionHtml?.find(
    (item) => item.matchLevel !== "none",
  );
  const hitShortDescription =
    props.item._highlightResult?.shortDescriptionHtml?.find(
      (item) => item.matchLevel !== "none",
    );

  return (
    <a class="bg-vibrant-blue relative rounded-3xl pt-16" href={`https://kompasio.sk/app/sk/map/${props.item.path}`}>
      <div class="text-vibrant-blue bg-shuttle-white rounded-3xl border p-6">
        <h2
          class="text-xl font-semibold"
          innerHTML={
            (props.item._highlightResult?.name?.value || props.item.name) ??
            null
          }
        />
        <p
          class="mb-4"
          innerHTML={
            (props.item._highlightResult?.town?.name?.value ||
              props.item.town) ??
            null
          }
        />
        <div class="mb-8">
          <For
            each={
              props.item._highlightResult?.shortDescriptionHtml ||
              props.item.shortDescriptionHtml
            }
          >
            {(paragraph) => <div innerHTML={paragraph.value} />}
          </For>
        </div>
        <Show
          when={
            hitDescription &&
            !(props.item._highlightResult.name.matchLevel !== "none") &&
            !hitShortDescription
          }
        >
          <div innerHTML={hitDescription.value} />
          <span class="text-red-orange">[útržok z popisu miesta]</span>
        </Show>
        <div class="flex gap-x-4 overflow-x-clip pt-4">
          <For each={props.item.categories}>
            {(category) => (
              <p
                class={`text-shuttle-white bg-vibrant-blue rounded-full px-2
                text-sm text-nowrap`}
              >
                {category.name}
              </p>
            )}
          </For>
        </div>
      </div>
    </a>
  );
};

export default ResultPlace;
