import { Alert, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { MetricTile } from "@/components/MetricTile";
import { Screen } from "@/components/Screen";
import { BodyText, Title } from "@/components/Typography";
import { Survey } from "@/types/domain";
import { dateTime, mt } from "@/utils/format";

interface Props {
  survey: Survey;
  onBack: () => void;
  onDelete: (surveyId: string) => void;
}

export const SurveyDetailsScreen = ({ survey, onBack, onDelete }: Props) => {
  return (
    <Screen>
      <Title>Survey Details</Title>
      <BodyText muted>Surveyed at {dateTime(survey.surveyedAt)}</BodyText>

      <View style={styles.metrics}>
        <MetricTile label="Cargo On Board" value={mt(survey.cargoOnBoardMt)} emphasis />
        <MetricTile label="Mean Draft" value={`${survey.meanDraftM.toFixed(3)} m`} />

        <MetricTile
          label="Corr Fwd"
          value={survey.correctedForwardDraft !== undefined ? `${survey.correctedForwardDraft.toFixed(3)} m` : "--"}
        />
        <MetricTile
          label="Corr Aft"
          value={survey.correctedAftDraft !== undefined ? `${survey.correctedAftDraft.toFixed(3)} m` : "--"}
        />
        <MetricTile label="Trim" value={survey.trim !== undefined ? `${survey.trim.toFixed(3)} m` : "--"} />

        <MetricTile label="TPC" value={survey.tpc !== undefined ? String(survey.tpc) : "--"} />
        <MetricTile label="LCF" value={survey.lcf !== undefined ? String(survey.lcf) : "--"} />
        <MetricTile label="MCTC" value={survey.mctc !== undefined ? String(survey.mctc) : "--"} />

        <MetricTile
          label="1st Trim Corr"
          value={survey.firstTrimCorrectionMt !== undefined ? `${survey.firstTrimCorrectionMt} MT` : "--"}
        />
        <MetricTile
          label="2nd Trim Corr"
          value={survey.secondTrimCorrectionMt !== undefined ? `${survey.secondTrimCorrectionMt} MT` : "--"}
        />

        <MetricTile
          label="Trim Corr Disp"
          value={survey.trimCorrectedDisplacementMt !== undefined ? mt(survey.trimCorrectedDisplacementMt) : "--"}
        />
        <MetricTile label="Final Disp" value={mt(survey.displacementMt)} />
      </View>

      <Card>
        <BodyText muted>All calculations are based on the hydrostatic table provided during vessel setup.</BodyText>
      </Card>

      <Button
        label="Delete Survey"
        variant="secondary"
        onPress={() =>
          Alert.alert("Delete Survey", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => onDelete(survey.id),
            },
          ])
        }
      />
      <Button label="Back" onPress={onBack} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10
  }
});
