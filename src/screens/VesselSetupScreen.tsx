import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { BodyText, SectionTitle, Title } from "@/components/Typography";
import { TextField } from "@/components/TextField";
import { createStarterHydrostaticTable, pickAndExtractHydrostaticPdf } from "@/services/hydrostaticPdf";
import { HydrostaticEntry, Vessel } from "@/types/domain";
import { createId } from "@/utils/ids";
import { decimal } from "@/utils/format";

interface Props {
  vessel?: Vessel;
  hydrostaticDraft?: { rows: HydrostaticEntry[]; fileName?: string; uri?: string };
  onSave: (vessel: Vessel) => void;
  onEditHydrostatic: (draft: HydrostaticEntry[], meta?: { fileName?: string; uri?: string }) => void;
}

export const VesselSetupScreen = ({ vessel, hydrostaticDraft, onSave, onEditHydrostatic }: Props) => {
  const [name, setName] = useState(vessel?.name ?? "");
  const [lightship, setLightship] = useState(vessel?.lightshipWeightMt?.toString() ?? "");
  const [constant, setConstant] = useState(vessel?.constantMt?.toString() ?? "0");
  const [lbp, setLbp] = useState(vessel?.lbp?.toString() ?? "");
const [forwardDraftMarkFromFP, setForwardDraftMarkFromFP] = useState(
  vessel?.forwardDraftMarkFromFP?.toString() ?? ""
);
const [aftDraftMarkFromAP, setAftDraftMarkFromAP] = useState(
  vessel?.aftDraftMarkFromAP?.toString() ?? ""
);
const [pdfName, setPdfName] = useState(vessel?.hydrostaticPdfName ?? hydrostaticDraft?.fileName);
  const [pdfUri, setPdfUri] = useState(vessel?.hydrostaticPdfUri ?? hydrostaticDraft?.uri);
  const [hydrostaticTable, setHydrostaticTable] = useState<HydrostaticEntry[]>(
    vessel?.hydrostaticTable?.length
      ? vessel.hydrostaticTable
      : hydrostaticDraft?.rows.length
        ? hydrostaticDraft.rows
        : createStarterHydrostaticTable()
  );

  const canSave = useMemo(() => name.trim().length > 0 && decimal(lightship) > 0 && hydrostaticTable.length > 0, [
    name,
    lightship,
    hydrostaticTable
  ]);

  const pickPdf = async () => {
    const result = await pickAndExtractHydrostaticPdf();
    if (!result) {
      return;
    }
    setPdfName(result.fileName);
    setPdfUri(result.uri);
    if (result.entries.length > 0) {
      setHydrostaticTable(result.entries);
    }
    Alert.alert("Hydrostatic PDF", result.extractionNote);
    onEditHydrostatic(result.entries.length > 0 ? result.entries : hydrostaticTable, {
      fileName: result.fileName,
      uri: result.uri
    });
  };

  const save = () => {
    if (!canSave) {
      Alert.alert("Missing vessel data", "Enter vessel name, lightship weight, and at least one hydrostatic row.");
      return;
    }
    onSave({
      id: vessel?.id ?? createId("vessel"),
      name: name.trim(),
      lightshipWeightMt: decimal(lightship),
      constantMt: decimal(constant),
    lbp: decimal(lbp),
    forwardDraftMarkFromFP: decimal(forwardDraftMarkFromFP),
    aftDraftMarkFromAP: decimal(aftDraftMarkFromAP),
      hydrostaticPdfName: pdfName,
      hydrostaticPdfUri: pdfUri,
      hydrostaticTable,
      updatedAt: new Date().toISOString()

    });
  };

  return (
    <Screen>
      <Title>Draft Tracker</Title>
      <BodyText muted>Operational draft survey tracking for loading and discharging. Local data only.</BodyText>

      <Card>
        <SectionTitle>Vessel Setup</SectionTitle>
        <TextField label="Vessel Name" value={name} onChangeText={setName} placeholder="MV Example" />
        <TextField
          label="Lightship Weight (MT)"
          value={lightship}
          onChangeText={setLightship}
          keyboardType="decimal-pad"
          placeholder="8450"
        />
        <TextField
          label="Constant (MT)"
          value={constant}
          onChangeText={setConstant}
          keyboardType="decimal-pad"
          placeholder="150"
        />
        <TextField
  label="LBP (m)"
  value={lbp}
  onChangeText={setLbp}
  keyboardType="decimal-pad"
  placeholder="180.0"
/>

<TextField
  label="Forward Draft Mark from FP (m)"
  value={forwardDraftMarkFromFP}
  onChangeText={setForwardDraftMarkFromFP}
  keyboardType="numbers-and-punctuation"
  placeholder="5.0"
/>

<TextField
  label="Aft Draft Mark from AP (m)"
  value={aftDraftMarkFromAP}
  onChangeText={setAftDraftMarkFromAP}
  keyboardType="numbers-and-punctuation"
  placeholder="5.0"
/>
      </Card>

      <Card>
        <SectionTitle>Hydrostatic Data</SectionTitle>
        <BodyText muted>{pdfName ? `PDF: ${pdfName}` : "Upload a hydrostatic PDF, then review or edit the table."}</BodyText>
        <View style={styles.actions}>
          <Button label="Upload Hydrostatic PDF" onPress={pickPdf} />
          <Button
            label={`Review Table (${hydrostaticTable.length})`}
            variant="secondary"
            onPress={() => onEditHydrostatic(hydrostaticTable, { fileName: pdfName, uri: pdfUri })}
          />
        </View>
      </Card>

      <Button label="Save Vessel" onPress={save} disabled={!canSave} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  actions: {
    gap: 10
  }
});
