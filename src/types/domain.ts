export type OperationType = "loading" | "discharging";

export type DraftPosition =
  | "forwardPort"
  | "forwardStarboard"
  | "midshipPort"
  | "midshipStarboard"
  | "aftPort"
  | "aftStarboard";

export interface Vessel {

  id: string;

  name: string;

  lightshipWeightMt: number;

  constantMt: number;

  aftDraftMarkFromAP: number; // + forward of AP, - abaft AP
  forwardDraftMarkFromFP: number; // + abaft FP, - forward of FP
  midshipDraftMarkFromMidship: number; // + abaft midship, - forward of midship

  lbp: number;

  hydrostaticPdfName?: string;

  hydrostaticPdfUri?: string;

  hydrostaticTable: HydrostaticEntry[];

  updatedAt: string;

}

export interface HydrostaticEntry {
  id: string;
  draftM: number;
  displacementMt: number;
  tpc?: number;
  mctc?: number;
  lcf?: number;
}

export interface Operation {
  id: string;
  vesselId: string;
  type: OperationType;
  targetCargoMt?: number;
  startedAt: string;
  completedAt?: string;
}

export interface SurveyInput {
  forwardPort: number;
  forwardStarboard: number;
  midshipPort: number;
  midshipStarboard: number;
  aftPort: number;
  aftStarboard: number;
  dockWaterDensity: number;
  ballastMt: number;
  freshWaterMt: number;
  fuelMt: number;
  surveyedAt: string;
}

export interface Survey extends SurveyInput {
  id: string;
  operationId: string;
  meanDraftM: number;
  displacementMt: number;
  tpc?: number;
  lcf?: number;
  mctc?: number;
  firstTrimCorrectionMt?: number;
  secondTrimCorrectionMt?: number;
  correctedForwardDraft?: number;
  correctedAftDraft?: number;
  trim?: number;
  trimCorrectedDisplacementMt?: number;
  finalDisplacementMt?: number;
  cargoOnBoardMt: number;
  createdAt: string;
}

export interface SurveyMetrics {
  previousChangeMt: number;
  commencementChangeMt: number;
  rateSincePreviousMtPerHour?: number;
  averageRateMtPerHour?: number;
  remainingCargoMt?: number;
  estimatedCompletionAt?: string;
  operationProgressPct?: number;
}

export interface DraftTrackerState {
  vessel?: Vessel;
  activeOperation?: Operation;
  surveys: Survey[];
}
