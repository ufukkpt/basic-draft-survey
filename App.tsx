import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { DraftTrackerState, HydrostaticEntry, Operation, Survey, Vessel } from "@/types/domain";
import { deleteSurvey, loadState, saveOperation, saveState, saveSurvey, saveVessel } from "@/services/storage";
import { VesselSetupScreen } from "@/screens/VesselSetupScreen";
import { HydrostaticEditorScreen } from "@/screens/HydrostaticEditorScreen";
import { StartOperationScreen } from "@/screens/StartOperationScreen";
import { SurveyInputScreen } from "@/screens/SurveyInputScreen";
import { ResultsScreen } from "@/screens/ResultsScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { SurveyDetailsScreen } from "@/screens/SurveyDetailsScreen";

type Route = "vessel" | "hydrostatic" | "start" | "survey" | "results" | "history";

interface HydrostaticDraft {
  rows: HydrostaticEntry[];
  fileName?: string;
  uri?: string;
}

export default function App() {
  const [state, setState] = useState<DraftTrackerState>({ surveys: [] });
  const [route, setRoute] = useState<Route>("vessel");
  const [loading, setLoading] = useState(true);
  const [hydrostaticDraft, setHydrostaticDraft] = useState<HydrostaticDraft>({ rows: [] });
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | undefined>();

  useEffect(() => {
    loadState()
      .then((stored) => {
        setState(stored);
        if (stored.activeOperation) {
          setRoute(stored.surveys.length ? "results" : "survey");
        } else if (stored.vessel) {
          setRoute("start");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveVessel = async (vessel: Vessel) => {
    const nextState = await saveVessel(vessel);
    setState(nextState);
    setRoute("start");
  };

  const handleHydrostaticSave = async (rows: HydrostaticEntry[]) => {
    const vessel = state.vessel;
    if (!vessel) {
      setHydrostaticDraft((current) => ({ ...current, rows }));
      setRoute("vessel");
      return;
    }
    const updated: Vessel = {
      ...vessel,
      hydrostaticTable: rows,
      hydrostaticPdfName: hydrostaticDraft.fileName ?? vessel.hydrostaticPdfName,
      hydrostaticPdfUri: hydrostaticDraft.uri ?? vessel.hydrostaticPdfUri,
      updatedAt: new Date().toISOString()
    };
    const nextState = await saveVessel(updated);
    setState(nextState);
    setRoute("vessel");
  };

  const openHydrostaticEditor = (rows: HydrostaticEntry[], meta?: { fileName?: string; uri?: string }) => {
    setHydrostaticDraft({ rows, fileName: meta?.fileName, uri: meta?.uri });
    setRoute("hydrostatic");
  };

  const handleCreateOperation = async (operation: Operation) => {
    const nextState = await saveOperation(operation);
    setState(nextState);
    setRoute("survey");
  };

  const handleSaveSurvey = async (survey: Survey) => {
    const nextState = await saveSurvey(survey);
    setState(nextState);
    setRoute("results");
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    const nextState = await deleteSurvey(surveyId);
    setState(nextState);
    setSelectedSurvey(undefined);
  };

  const handleResetOperation = () => {
    Alert.alert("Start new operation?", "This clears the active survey list from local storage.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Start New",
        style: "destructive",
        onPress: async () => {
          const nextState = { vessel: state.vessel, surveys: [] };
          await saveState(nextState);
          setState(nextState);
          setRoute("start");
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      </SafeAreaProvider>
    );
  }

  const vessel = state.vessel;
  const operation = state.activeOperation;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {route === "vessel" && (
        <VesselSetupScreen
          vessel={vessel}
          hydrostaticDraft={!vessel ? hydrostaticDraft : undefined}
          onSave={handleSaveVessel}
          onEditHydrostatic={openHydrostaticEditor}
        />
      )}
      {route === "hydrostatic" && (
        <HydrostaticEditorScreen
          rows={hydrostaticDraft.rows}
          fileName={hydrostaticDraft.fileName}
          onCancel={() => setRoute(vessel ? "vessel" : "vessel")}
          onSave={handleHydrostaticSave}
        />
      )}
      {route === "start" && vessel && (
        <StartOperationScreen
          vessel={vessel}
          onCreate={handleCreateOperation}
          onBackToVessel={() => setRoute("vessel")}
        />
      )}
      {route === "survey" && vessel && operation && (
        <SurveyInputScreen
          vessel={vessel}
          operation={operation}
          onSave={handleSaveSurvey}
          onResults={() => setRoute("results")}
          onCheckHydrostatic={openHydrostaticEditor}
        />
      )}
      {route === "results" && operation && (
        <ResultsScreen
          operation={operation}
          surveys={state.surveys}
          onAddSurvey={() => setRoute("survey")}
          onHistory={() => setRoute("history")}
          onNewOperation={handleResetOperation}
        />
      )}
      {selectedSurvey && (
        <SurveyDetailsScreen
          survey={selectedSurvey}
          onBack={() => setSelectedSurvey(undefined)}
          onDelete={handleDeleteSurvey}
        />
      )}
      {route === "history" && operation && !selectedSurvey && (
        <HistoryScreen operation={operation} surveys={state.surveys} onBack={() => setRoute("results")} onSelectSurvey={setSelectedSurvey} />
      )}
      {route === "start" && !vessel && (
        <VesselSetupScreen
          vessel={vessel}
          hydrostaticDraft={hydrostaticDraft}
          onSave={handleSaveVessel}
          onEditHydrostatic={openHydrostaticEditor}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center"
  }
});
