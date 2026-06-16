import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

interface MetricTileProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

export const MetricTile = ({ label, value, emphasis }: MetricTileProps) => (
  <View style={[styles.tile, emphasis && styles.emphasis]}>
    <Text style={[styles.value, emphasis && styles.emphasisValue]}>{value}</Text>
    <Text style={[styles.label, emphasis && styles.emphasisLabel]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: "46%",
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 5
  },
  emphasis: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  value: {
    color: colors.ink,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900"
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700"
  },
  emphasisValue: {
    color: colors.surface
  },
  emphasisLabel: {
    color: "#dce9e6"
  }
});
