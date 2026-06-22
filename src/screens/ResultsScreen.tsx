import { StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { MetricTile } from "@/components/MetricTile";
import { Screen } from "@/components/Screen";
import { BodyText, SectionTitle, Title } from "@/components/Typography";
import { calculateSurveyMetrics } from "@/services/calculations";
import { Operation, Survey } from "@/types/domain";
import { dateTime, mt, pct, rate } from "@/utils/format";

interface Props {
  operation: Operation;
  surveys: Survey[];
  onAddSurvey: () => void;
  onHistory: () => void;
  onNewOperation: () => void;
}

export const ResultsScreen = ({ operation, surveys, onAddSurvey, onHistory, onNewOperation }: Props) => {
  const latest = surveys[surveys.length - 1];
  const metrics = latest ? calculateSurveyMetrics(latest, surveys, operation) : undefined;

  return (
    <Screen>
      <Title>Results</Title>
      <BodyText muted>{operation.type === "loading" ? "Loading" : "Discharging"} · Started {dateTime(operation.startedAt)}</BodyText>

      {!latest ? (
        <Card>
          <SectionTitle>No Surveys Yet</SectionTitle>
          <BodyText muted>Add the commencement survey to start tracking cargo and rates.</BodyText>
        </Card>
      ) : (
        <>
          <View style={styles.metrics}>
            <MetricTile label="Current Cargo On Board" value={mt(latest.cargoOnBoardMt)} emphasis />
            <MetricTile label="Mean Draft" value={`${latest.meanDraftM.toFixed(3)} m`} />
            <MetricTile label="Displacement" value={mt(latest.displacementMt)} />
            <MetricTile
              label="TPC"
              value={latest.tpc !== undefined ? String(latest.tpc) : "--"}
            />
            <MetricTile
              label="LCF"
              value={latest.lcf !== undefined ? String(latest.lcf) : "--"}
            />
            <MetricTile
              label="MCTC"
              value={latest.mctc !== undefined ? String(latest.mctc) : "--"}
            />
            <MetricTile
              label="1st Trim Corr"
              value={
                latest.firstTrimCorrectionMt !== undefined
                  ? `${latest.firstTrimCorrectionMt} MT`
                  : "--"
              }
            />
            <MetricTile label="Since Previous" value={mt(metrics?.previousChangeMt)} />
            <MetricTile label="Since Commencement" value={mt(metrics?.commencementChangeMt)} />
            <MetricTile label="Rate Since Previous" value={rate(metrics?.rateSincePreviousMtPerHour)} />
            <MetricTile label="Average Operation Rate" value={rate(metrics?.averageRateMtPerHour)} />
            <MetricTile label="Remaining To Target" value={mt(metrics?.remainingCargoMt)} />
            <MetricTile label="Progress" value={pct(metrics?.operationProgressPct)} />
          </View>

          <Card>
            <SectionTitle>Estimated Completion</SectionTitle>
            <BodyText>{metrics?.estimatedCompletionAt ? dateTime(metrics.estimatedCompletionAt) : "--"}</BodyText>
          </Card>
        </>
      )}

      <Button label="Add Survey" onPress={onAddSurvey} />
      <Button label="History" variant="secondary" onPress={onHistory} />
      <Button label="Start New Operation" variant="secondary" onPress={onNewOperation} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  }
});
