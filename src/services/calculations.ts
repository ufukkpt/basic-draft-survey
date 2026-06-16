import { HydrostaticEntry, Operation, Survey, SurveyInput, SurveyMetrics, Vessel } from "@/types/domain";

const SEA_WATER_DENSITY = 1.025;

export const round = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
export const calculateCorrectedDrafts = (
  input: SurveyInput,
  vessel: Vessel
) => {
  const forwardMean =
    (input.forwardPort + input.forwardStarboard) / 2;

  const aftMean =
    (input.aftPort + input.aftStarboard) / 2;

  const trim = aftMean - forwardMean;

  const correctedForwardDraft =
    forwardMean -
    (vessel.forwardDraftMarkFromFP / vessel.lbp) * trim;

  const correctedAftDraft =
    aftMean +
    (vessel.aftDraftMarkFromAP / vessel.lbp) * trim;

  return {
    correctedForwardDraft: round(correctedForwardDraft, 3),
    correctedAftDraft: round(correctedAftDraft, 3),
    trim: round(trim, 3)
  };
};
export const calculateMeanDraft = (
  input: SurveyInput,
  vessel?: Vessel
) => {
  const forwardMean =
    (input.forwardPort + input.forwardStarboard) / 2;

  const midshipMean =
    (input.midshipPort + input.midshipStarboard) / 2;

  const aftMean =
    (input.aftPort + input.aftStarboard) / 2;

  if (
    !vessel ||
    !vessel.lbp ||
    vessel.lbp <= 0
  ) {
    return round(
      (forwardMean + 6 * midshipMean + aftMean) / 8,
      3
    );
  }

  const trim = aftMean - forwardMean;

  const correctedForward =
    forwardMean -
    (vessel.forwardDraftMarkFromFP / vessel.lbp) * trim;

  const correctedAft =
    aftMean +
    (vessel.aftDraftMarkFromAP / vessel.lbp) * trim;

  return round(
    (correctedForward + 6 * midshipMean + correctedAft) / 8,
    3
  );
};
export const interpolateDisplacement = (meanDraftM: number, table: HydrostaticEntry[]) => {
  const ordered = [...table].sort((a, b) => a.draftM - b.draftM);
  if (ordered.length === 0) {
    return 0;
  }

  if (meanDraftM <= ordered[0].draftM) {
    return ordered[0].displacementMt;
  }

  const last = ordered[ordered.length - 1];
  if (meanDraftM >= last.draftM) {
    return last.displacementMt;
  }

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const lower = ordered[index];
    const upper = ordered[index + 1];
    if (meanDraftM >= lower.draftM && meanDraftM <= upper.draftM) {
      const ratio = (meanDraftM - lower.draftM) / (upper.draftM - lower.draftM);
      return round(lower.displacementMt + ratio * (upper.displacementMt - lower.displacementMt), 2);
    }
  }

  return last.displacementMt;
};

export const correctDisplacementForDensity = (saltWaterDisplacementMt: number, dockWaterDensity: number) =>
  round(saltWaterDisplacementMt * (dockWaterDensity / SEA_WATER_DENSITY), 2);

export const calculateCargoOnBoard = (vessel: Vessel, input: SurveyInput) => {

  const meanDraftM = calculateMeanDraft(input,vessel);
  const hydrostaticDisplacement = interpolateDisplacement(meanDraftM, vessel.hydrostaticTable);
  const displacementMt = correctDisplacementForDensity(hydrostaticDisplacement, input.dockWaterDensity);
  const cargoOnBoardMt =
    displacementMt -
    vessel.lightshipWeightMt -
    vessel.constantMt -
    input.ballastMt -
    input.freshWaterMt -
    input.fuelMt;

  return {
    meanDraftM,
    displacementMt,
    cargoOnBoardMt: round(cargoOnBoardMt, 2)
  };
};

const hoursBetween = (startIso: string, endIso: string) => {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return ms / 1000 / 60 / 60;
};

export const calculateSurveyMetrics = (
  survey: Survey,
  allSurveys: Survey[],
  operation: Operation
): SurveyMetrics => {
  const ordered = [...allSurveys].sort(
    (a, b) => new Date(a.surveyedAt).getTime() - new Date(b.surveyedAt).getTime()
  );
  const index = ordered.findIndex((item) => item.id === survey.id);
  const commencement = ordered[0] ?? survey;
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const direction = operation.type === "loading" ? 1 : -1;
  const previousChangeMt = previous ? direction * (survey.cargoOnBoardMt - previous.cargoOnBoardMt) : 0;
  const commencementChangeMt = direction * (survey.cargoOnBoardMt - commencement.cargoOnBoardMt);
  const previousHours = previous ? hoursBetween(previous.surveyedAt, survey.surveyedAt) : undefined;
  const totalHours = hoursBetween(commencement.surveyedAt, survey.surveyedAt);
  const rateSincePreviousMtPerHour =
    previousHours && previousHours > 0 ? round(previousChangeMt / previousHours, 2) : undefined;
  const averageRateMtPerHour = totalHours > 0 ? round(commencementChangeMt / totalHours, 2) : undefined;

  if (!operation.targetCargoMt || operation.targetCargoMt <= 0) {
    return {
      previousChangeMt: round(previousChangeMt, 2),
      commencementChangeMt: round(commencementChangeMt, 2),
      rateSincePreviousMtPerHour,
      averageRateMtPerHour
    };
  }

  const remainingCargoMt = round(Math.max(operation.targetCargoMt - commencementChangeMt, 0), 2);
  const operationProgressPct = round(Math.min(Math.max((commencementChangeMt / operation.targetCargoMt) * 100, 0), 100), 1);
  const usableRate = rateSincePreviousMtPerHour && rateSincePreviousMtPerHour > 0
    ? rateSincePreviousMtPerHour
    : averageRateMtPerHour;
  const estimatedCompletionAt =
    usableRate && usableRate > 0
      ? new Date(new Date(survey.surveyedAt).getTime() + (remainingCargoMt / usableRate) * 60 * 60 * 1000).toISOString()
      : undefined;

  return {
    previousChangeMt: round(previousChangeMt, 2),
    commencementChangeMt: round(commencementChangeMt, 2),
    rateSincePreviousMtPerHour,
    averageRateMtPerHour,
    remainingCargoMt,
    estimatedCompletionAt,
    operationProgressPct
  };
};
