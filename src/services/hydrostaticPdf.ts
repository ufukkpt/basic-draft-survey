import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { HydrostaticEntry } from "@/types/domain";
import { createId } from "@/utils/ids";

export interface HydrostaticImportResult {
  fileName: string;
  uri: string;
  entries: HydrostaticEntry[];
  extractionNote: string;
}

const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

const decodeBase64ToLatin1 = (input: string) => {
  let output = "";
  let buffer = 0;
  let bits = 0;

  for (const char of input.replace(/[^A-Za-z0-9+/=]/g, "")) {
    if (char === "=") {
      break;
    }
    const value = base64Chars.indexOf(char);
    if (value < 0) {
      continue;
    }
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
};

const extractEntriesFromText = (text: string) => {
  const rows: HydrostaticEntry[] = [];
  const normalized = text.replace(/,/g, "");
  const rowPattern = /(?:^|[\s(])(\d{1,2}\.\d{1,3})\s+(\d{4,7}(?:\.\d+)?)(?:\s|$)/g;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(normalized)) !== null) {
    const draftM = Number(match[1]);
    const displacementMt = Number(match[2]);
    if (draftM > 0 && draftM < 30 && displacementMt > 1000) {
      rows.push({
        id: createId("hydro"),
        draftM,
        displacementMt
      });
    }
  }

  const uniqueByDraft = new Map<string, HydrostaticEntry>();
  rows.forEach((row) => uniqueByDraft.set(row.draftM.toFixed(3), row));

  return [...uniqueByDraft.values()]
    .sort((a, b) => a.draftM - b.draftM)
    .slice(0, 250);
};

export const pickAndExtractHydrostaticPdf = async (): Promise<HydrostaticImportResult | undefined> => {
  const picked = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    copyToCacheDirectory: true
  });

  if (picked.canceled || !picked.assets[0]) {
    return undefined;
  }

  const asset = picked.assets[0];
  const file = new File(asset.uri);
  const base64 = await file.base64();
  const text = decodeBase64ToLatin1(base64);
  const entries = extractEntriesFromText(text);

  return {
    fileName: asset.name,
    uri: asset.uri,
    entries,
    extractionNote:
      entries.length > 0
        ? `${entries.length} displacement rows detected. Review against the vessel hydrostatic table before using.`
        : "No table rows detected. Add draft and displacement rows manually from the hydrostatic PDF."
  };
};

export const createStarterHydrostaticTable = (): HydrostaticEntry[] =>
  [
    [4, 10300],
    [5, 12875],
    [6, 15450],
    [7, 18025],
    [8, 20600],
    [9, 23175],
    [10, 25750],
    [11, 28325],
    [12, 30900]
  ].map(([draftM, displacementMt]) => ({
    id: createId("hydro"),
    draftM,
    displacementMt
  }));
