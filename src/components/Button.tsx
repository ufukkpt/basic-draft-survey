import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button = ({ label, onPress, variant = "primary", disabled, style }: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      styles[variant],
      disabled && styles.disabled,
      pressed && !disabled && styles.pressed,
      style
    ]}
  >
    <Text style={[styles.label, variant !== "primary" && styles.secondaryLabel]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 2
  },
  primary: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.navy
  },
  danger: {
    backgroundColor: colors.surface,
    borderColor: colors.danger
  },
  disabled: {
    opacity: 0.5
  },
  pressed: {
    transform: [{ scale: 0.99 }]
  },
  label: {
    color: colors.surface,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800"
  },
  secondaryLabel: {
    color: colors.navy
  }
});
