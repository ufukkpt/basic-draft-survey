import AsyncStorage from "@react-native-async-storage/async-storage";
import { DraftTrackerState, Operation, Survey, Vessel } from "@/types/domain";

const STORAGE_KEY = "draft-tracker:v1";

const initialState: DraftTrackerState = {
  surveys: []
};

export const loadState = async (): Promise<DraftTrackerState> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialState;
  }

  try {
    const parsed = JSON.parse(raw) as DraftTrackerState;
    return {
      ...initialState,
      ...parsed,
      surveys: parsed.surveys ?? []
    };
  } catch {
    return initialState;
  }
};

export const saveState = async (state: DraftTrackerState) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const saveVessel = async (vessel: Vessel) => {
  const state = await loadState();
  const nextState = { ...state, vessel };
  await saveState(nextState);
  return nextState;
};

export const saveOperation = async (operation: Operation) => {
  const state = await loadState();
  const nextState = { ...state, activeOperation: operation, surveys: [] };
  await saveState(nextState);
  return nextState;
};

export const saveSurvey = async (survey: Survey) => {
  const state = await loadState();
  const surveys = [...state.surveys.filter((item) => item.id !== survey.id), survey].sort(
    (a, b) => new Date(a.surveyedAt).getTime() - new Date(b.surveyedAt).getTime()
  );
  const nextState = { ...state, surveys };
  await saveState(nextState);
  return nextState;
};

export const clearAllData = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
