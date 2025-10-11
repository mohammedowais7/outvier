import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, spacing, text } from "../theme";

export default function TextField({ label, secureTextEntry, value, onChangeText, keyboardType, autoCapitalize }){
  return (
    <View style={{ marginBottom: spacing(1.5) }}>
      {!!label && <Text style={text.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.text,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    borderRadius: 12,
  },
});

