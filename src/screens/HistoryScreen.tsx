import { StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { BodyText, SectionTitle, Title } from "@/components/Typography";
import { calculateSurveyMetrics } from "@/services/calculations";
import { Operation, Survey } from "@/types/domain";
import { dateTime, mt } from "@/utils/format";

interface Props {
  operation: Operation;
  surveys: Survey[];
  onBack: () => void;
}

export const HistoryScreen = ({ operation, surveys, onBack }: Props) => (
  <Screen>
    <Title>History</Title>
    <BodyText muted>Chronological survey log stored locally on this device.</BodyText>

    {surveys.length === 0 ? (
      <Card>
        <SectionTitle>No Surveys</SectionTitle>
        <BodyText muted>Saved surveys will appear here.</BodyText>
      </Card>
    ) : (
      surveys.map((survey, index) => {
        const metrics = calculateSurveyMetrics(survey, surveys, operation);
        return (
          <Card key={survey.id}>
            <View style={styles.header}>
              <SectionTitle>Survey {index + 1}</SectionTitle>
              <BodyText muted>{dateTime(survey.surveyedAt)}</BodyText>
            </View>
            <BodyText>Cargo On Board: {mt(survey.cargoOnBoardMt)}</BodyText>
            <BodyText>Change Since Previous: {mt(metrics.previousChangeMt)}</BodyText>
            <BodyText>Change Since Commencement: {mt(metrics.commencementChangeMt)}</BodyText>
          </Card>
        );
      })
    )}

    <Button label="Back To Results" onPress={onBack} />
  </Screen>
);

const styles = StyleSheet.create({
  header: {
    gap: 4
  }
});
