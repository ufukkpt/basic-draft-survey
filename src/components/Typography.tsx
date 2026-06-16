import { PropsWithChildren } from "react";
import { StyleSheet, Text, TextStyle } from "react-native";
import { colors } from "@/theme/colors";

export const Title = ({ children, style }: PropsWithChildren<{ style?: TextStyle }>) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

export const SectionTitle = ({ children }: PropsWithChildren) => <Text style={styles.sectionTitle}>{children}</Text>;

export const BodyText = ({ children, muted }: PropsWithChildren<{ muted?: boolean }>) => (
  <Text style={[styles.body, muted && styles.muted]}>{children}</Text>
);

export const Label = ({ children }: PropsWithChildren) => <Text style={styles.label}>{children}</Text>;

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800"
  },
  body: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 23
  },
  muted: {
    color: colors.muted
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700"
  }
});
