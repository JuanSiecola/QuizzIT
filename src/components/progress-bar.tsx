import { colors, radius } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  value: number;
  total: number;
};

export function ProgressBar({ value, total }: Props) {
  const progress = total > 0 ? Math.min(value / total, 1) : 0;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
