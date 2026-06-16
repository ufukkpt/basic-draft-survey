import { KeyboardTypeOptions, StyleSheet, TextInput, View } from "react-native";
import { Label } from "@/components/Typography";
import { colors } from "@/theme/colors";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
}

export const TextField = ({ label, value, onChangeText, placeholder, keyboardType = "default" }: TextFieldProps) => (
  <View style={styles.wrap}>
    <Label>{label}</Label>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      placeholderTextColor={colors.muted}
      style={styles.input}
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    gap: 7
  },
  input: {
    minHeight: 54,
    borderRadius: 8,
    borderColor: colors.line,
    borderWidth: 2,
    backgroundColor: colors.input,
    color: colors.ink,
    fontSize: 18,
    paddingHorizontal: 14
  }
});
