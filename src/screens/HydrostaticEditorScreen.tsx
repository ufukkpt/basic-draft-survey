import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { BodyText, SectionTitle, Title } from "@/components/Typography";
import { HydrostaticEntry } from "@/types/domain";
import { decimal } from "@/utils/format";
import { createId } from "@/utils/ids";

type EditableHydrostaticRow = {
  id: string;
  draftM: string;
  displacementMt: string;
  tpc: string;
  mctc: string;
  lcf: string;
};

interface Props {
  rows: HydrostaticEntry[];
  fileName?: string;
  onCancel: () => void;
  onSave: (rows: HydrostaticEntry[]) => void;
}

export const HydrostaticEditorScreen = ({ rows, fileName, onCancel, onSave }: Props) => {
  const [draftRows, setDraftRows] = useState<EditableHydrostaticRow[]>(
    rows.map((r) => ({
      id: r.id,
      draftM: String(r.draftM ?? ""),
      displacementMt: String(r.displacementMt ?? ""),
      tpc: String(r.tpc ?? ""),
      mctc: String(r.mctc ?? ""),
      lcf: String(r.lcf ?? ""),
    }))
  );

  const updateRow = (
    id: string,
    key: keyof Omit<EditableHydrostaticRow, "id">,
    value: string
  ) => {
    setDraftRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  };

  const addRow = () => {
    setDraftRows((current) => [
      ...current,
      {
        id: createId("hydro"),
        draftM: "",
        displacementMt: "",
        tpc: "",
        mctc: "",
        lcf: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    setDraftRows((current) => current.filter((row) => row.id !== id));
  };

  const save = () => {
    const cleanRows: HydrostaticEntry[] = draftRows
      .map((r) => ({
        id: r.id,
        draftM: decimal(r.draftM),
        displacementMt: decimal(r.displacementMt),
        tpc: decimal(r.tpc),
        mctc: decimal(r.mctc),
        lcf: decimal(r.lcf),
      }))
      .filter((row) => row.draftM > 0 && row.displacementMt > 0)
      .sort((a, b) => a.draftM - b.draftM);

    if (cleanRows.length === 0) {
      Alert.alert(
        "Hydrostatic table required",
        "Add at least one valid draft and displacement row."
      );
      return;
    }
    onSave(cleanRows);
  };

  return (
    <Screen>
      <Title>Hydrostatic Table</Title>
      <BodyText muted>{fileName ? fileName : "Manual table"}</BodyText>
      <Card>
        <SectionTitle>Draft / Displacement Rows</SectionTitle>
        {draftRows.map((row, index) => (
          <View key={row.id} style={styles.row}>
            <TextField
              label={`Draft ${index + 1} (m)`}
              value={row.draftM}
              onChangeText={(value) => updateRow(row.id, "draftM", value)}
              keyboardType="decimal-pad"
            />
            <TextField
              label="Displacement (MT)"
              value={row.displacementMt}
              onChangeText={(value) => updateRow(row.id, "displacementMt", value)}
              keyboardType="decimal-pad"
            />
            <TextField
              label="TPC"
              value={row.tpc}
              onChangeText={(value) => updateRow(row.id, "tpc", value)}
              keyboardType="numbers-and-punctuation"
            />

            <TextField
              label="MCTC"
              value={row.mctc}
              onChangeText={(value) => updateRow(row.id, "mctc", value)}
              keyboardType="numbers-and-punctuation"
            />

            <TextField
              label="LCF"
              value={row.lcf}
              onChangeText={(value) => updateRow(row.id, "lcf", value)}
              keyboardType="numbers-and-punctuation"
            />
            <Button
              label="Remove Row"
              variant="danger"
              onPress={() => removeRow(row.id)}
            />
          </View>
        ))}
        <Button label="Add Row" variant="secondary" onPress={addRow} />
      </Card>
      <View style={styles.actions}>
        <Button label="Save Hydrostatic Table" onPress={save} />
        <Button label="Cancel" variant="secondary" onPress={onCancel} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ccd6cf"
  },
  actions: {
    gap: 10
  }
});
