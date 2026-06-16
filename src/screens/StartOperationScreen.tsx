import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { BodyText, SectionTitle, Title } from "@/components/Typography";
import { colors } from "@/theme/colors";
import { Operation, OperationType, Vessel } from "@/types/domain";
import { decimal } from "@/utils/format";
import { createId } from "@/utils/ids";

interface Props {
  vessel: Vessel;
  onCreate: (operation: Operation) => void;
  onBackToVessel: () => void;
}

export const StartOperationScreen = ({ vessel, onCreate, onBackToVessel }: Props) => {
  const [type, setType] = useState<OperationType>("loading");
  const [target, setTarget] = useState("");

  const create = () => {
    const targetCargoMt = target.trim() ? decimal(target) : undefined;
    if (targetCargoMt !== undefined && targetCargoMt <= 0) {
      Alert.alert("Check target", "Target cargo must be greater than zero.");
      return;
    }
    onCreate({
      id: createId("operation"),
      vesselId: vessel.id,
      type,
      targetCargoMt,
      startedAt: new Date().toISOString()
    });
  };

  return (
    <Screen>
      <Title>{vessel.name}</Title>
      <BodyText muted>Lightship {vessel.lightshipWeightMt.toLocaleString()} MT · Constant {vessel.constantMt.toLocaleString()} MT</BodyText>

      <Card>
        <SectionTitle>Start Operation</SectionTitle>
        <View style={styles.segment}>
          {(["loading", "discharging"] as OperationType[]).map((option) => (
            <Pressable
              key={option}
              onPress={() => setType(option)}
              style={[styles.segmentItem, type === option && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, type === option && styles.segmentActiveText]}>
                {option === "loading" ? "Loading" : "Discharging"}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextField
          label="Target Cargo Quantity (optional)"
          value={target}
          onChangeText={setTarget}
          keyboardType="decimal-pad"
          placeholder="18000"
        />
      </Card>

      <Button label="Create Operation" onPress={create} />
      <Button label="Edit Vessel Setup" variant="secondary" onPress={onBackToVessel} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.navy,
    overflow: "hidden"
  },
  segmentItem: {
    flex: 1,
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface
  },
  segmentActive: {
    backgroundColor: colors.navy
  },
  segmentText: {
    color: colors.navy,
    fontWeight: "900",
    fontSize: 16
  },
  segmentActiveText: {
    color: colors.surface
  }
});
