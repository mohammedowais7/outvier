import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

export default function GoalItem({ goal }){
  const pct = Math.max(0, Math.min(100, goal.progress || 0));
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{goal.title}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.progressText}>{pct}% complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing(1.5),
    marginBottom: spacing(1.25),
  },
  title: { color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: spacing(1) },
  progressBar: {
    backgroundColor: colors.surface2,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    height: 10,
  },
  progressFill: { backgroundColor: colors.accent, height: "100%" },
  progressText: { color: colors.textMuted, marginTop: spacing(0.5), fontSize: 12 },
});

