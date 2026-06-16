import { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

export const Screen = ({ children }: PropsWithChildren) => (
  <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

export const FixedBottom = ({ children }: PropsWithChildren) => <View style={styles.fixedBottom}>{children}</View>;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  flex: {
    flex: 1
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 40
  },
  fixedBottom: {
    gap: 12
  }
});
