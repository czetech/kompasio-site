import { createStore, produce } from "solid-js/store";
import { createRoot, batch, createMemo } from "solid-js";
import { makePersisted, storageSync } from "@solid-primitives/storage";

const createJourneyStore = () => {
  const STORAGE_KEY = "journeyStore";

  const [state, setState] = makePersisted(createStore({}), {
    name: STORAGE_KEY,
    sync: storageSync,
  });

  const ensureStep = (journeyUuid, stepUuid) => {
    setState(
      produce((state) => {
        state.journeys ??= {};
        state.journeys[journeyUuid] ??= {};
        state.journeys[journeyUuid].steps ??= {};
        state.journeys[journeyUuid].steps[stepUuid] ??= {};
      }),
    );
  };

  const getStepState = (journeyUuid, stepUuid) =>
    createMemo(() => state.journeys?.[journeyUuid]?.steps?.[stepUuid]);

  const setCompleted = (journeyUuid, stepUuid, isCompleted) => {
    batch(() => {
      ensureStep(journeyUuid, stepUuid);
      setState(
        produce((state) => {
          state.journeys[journeyUuid].steps[stepUuid].isCompleted = isCompleted;
        }),
      );
    });
  };

  const setTaskDone = (journeyUuid, stepUuid, taskUuid, isDone) => {
    batch(() => {
      ensureStep(journeyUuid, stepUuid);
      setState(
        produce((state) => {
          state.journeys[journeyUuid].steps[stepUuid].tasks ??= {};
          state.journeys[journeyUuid].steps[stepUuid].tasks[taskUuid] ??= {};
          state.journeys[journeyUuid].steps[stepUuid].tasks[taskUuid].isDone = isDone;
        }),
      );
    });
  };

  const deleteStep = (journeyUuid, stepUuid) => {
    setState(
      produce((state) => {
        delete state.journeys[journeyUuid].steps[stepUuid];
      }),
    );
  };

  const deleteJourney = (journeyUuid) => {
    setState(
      produce((state) => {
        delete state.journeys[journeyUuid];
      }),
    );
  };

  return {
    state,
    getStepState,
    setCompleted,
    setTaskDone,
    deleteStep,
    deleteJourney,
  };
};

export const journeyStore = createRoot(createJourneyStore);
