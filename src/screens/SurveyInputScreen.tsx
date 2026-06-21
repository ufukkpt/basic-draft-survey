import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { BodyText, SectionTitle, Title } from "@/components/Typography";
import { calculateCargoOnBoard } from "@/services/calculations";
import { Operation, Survey, SurveyInput, Vessel, HydrostaticEntry } from "@/types/domain";
import { decimal } from "@/utils/format";
import { createId } from "@/utils/ids";

interface Props {
  vessel: Vessel;
  operation: Operation;
  onSave: (survey: Survey) => void;
  onResults: () => void;
  onCheckHydrostatic: (rows: HydrostaticEntry[], meta?: { fileName?: string; uri?: string }) => void;
}

type FormState = Record<keyof Omit<SurveyInput, "surveyedAt">, string> & { surveyedAt: string };

const initialForm = (): FormState => ({
  forwardPort: "",
  forwardStarboard: "",
  midshipPort: "",
  midshipStarboard: "",
  aftPort: "",
  aftStarboard: "",
  dockWaterDensity: "1.025",
  ballastMt: "0",
  freshWaterMt: "0",
  fuelMt: "0",
  surveyedAt: new Date().toISOString()
});

export const SurveyInputScreen = ({ vessel, operation, onSave, onResults, onCheckHydrostatic }: Props) => {
  const [form, setForm] = useState<FormState>(initialForm);

  const setValue = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const buildInput = (): SurveyInput => ({
    forwardPort: decimal(form.forwardPort),
    forwardStarboard: decimal(form.forwardStarboard),
    midshipPort: decimal(form.midshipPort),
    midshipStarboard: decimal(form.midshipStarboard),
    aftPort: decimal(form.aftPort),
    aftStarboard: decimal(form.aftStarboard),
    dockWaterDensity: decimal(form.dockWaterDensity),
    ballastMt: decimal(form.ballastMt),
    freshWaterMt: decimal(form.freshWaterMt),
    fuelMt: decimal(form.fuelMt),
    surveyedAt: form.surveyedAt
  });

  const save = () => {
    const input = buildInput();
    const drafts = [
      input.forwardPort,
      input.forwardStarboard,
      input.midshipPort,
      input.midshipStarboard,
      input.aftPort,
      input.aftStarboard
    ];
    if (drafts.some((draft) => draft <= 0) || input.dockWaterDensity <= 0) {
      Alert.alert("Check survey", "Enter all six drafts and dock water density.");
      return;
    }
    try {
  const calculated = calculateCargoOnBoard(vessel, input);

  onSave({
    ...input,
    ...calculated,
    id: createId("survey"),
    operationId: operation.id,
    createdAt: new Date().toISOString()
  });

  setForm(initialForm());

} catch (error) {

  Alert.alert(
    "Hydrostatic Table Check",
    error instanceof Error
      ? error.message
      : "Check drafts and hydrostatic table."
  );

  return;
}
  };

  return (
    <Screen>
      <Title>Survey Input</Title>
      <BodyText muted>{operation.type === "loading" ? "Loading" : "Discharging"} operation</BodyText>

      <Card>
        <SectionTitle>Drafts</SectionTitle>
        <View style={styles.grid}>
          <TextField label="Fwd Port" value={form.forwardPort} onChangeText={(value) => setValue("forwardPort", value)} keyboardType="decimal-pad" />
          <TextField label="Fwd Stbd" value={form.forwardStarboard} onChangeText={(value) => setValue("forwardStarboard", value)} keyboardType="decimal-pad" />
          <TextField label="Mid Port" value={form.midshipPort} onChangeText={(value) => setValue("midshipPort", value)} keyboardType="decimal-pad" />
          <TextField label="Mid Stbd" value={form.midshipStarboard} onChangeText={(value) => setValue("midshipStarboard", value)} keyboardType="decimal-pad" />
          <TextField label="Aft Port" value={form.aftPort} onChangeText={(value) => setValue("aftPort", value)} keyboardType="decimal-pad" />
          <TextField label="Aft Stbd" value={form.aftStarboard} onChangeText={(value) => setValue("aftStarboard", value)} keyboardType="decimal-pad" />
        </View>
      </Card>

      <Card>
        <SectionTitle>Deductions</SectionTitle>
        <TextField label="Dock Water Density" value={form.dockWaterDensity} onChangeText={(value) => setValue("dockWaterDensity", value)} keyboardType="decimal-pad" />
        <TextField label="Total Ballast Weight (MT)" value={form.ballastMt} onChangeText={(value) => setValue("ballastMt", value)} keyboardType="decimal-pad" />
        <TextField label="Total Fresh Water Weight (MT)" value={form.freshWaterMt} onChangeText={(value) => setValue("freshWaterMt", value)} keyboardType="decimal-pad" />
        <TextField label="Total Fuel Weight (MT)" value={form.fuelMt} onChangeText={(value) => setValue("fuelMt", value)} keyboardType="decimal-pad" />
      </Card>

      <Card>
        <SectionTitle>Survey Time</SectionTitle>
        <TextField label="Survey Date and Time" value={form.surveyedAt} onChangeText={(value) => setValue("surveyedAt", value)} />
      </Card>

      <Button label="Save Survey" onPress={save} />
      <Button
        label="Check Hydrostatic Table"
        variant="secondary"
        onPress={() =>
          onCheckHydrostatic(vessel.hydrostaticTable, {
            fileName: vessel.hydrostaticPdfName,
            uri: vessel.hydrostaticPdfUri,
          })
        }
      />
      <Button label="View Results" variant="secondary" onPress={onResults} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 12
  }
});
