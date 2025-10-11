import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors, spacing, text } from "../theme";

export default function PrimaryButton({ title, onPress, disabled, loading, style }){
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, (disabled||loading) && { opacity: 0.6 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.bg} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing(1.25),
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { ...text.button },
});

