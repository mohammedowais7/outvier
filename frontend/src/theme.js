export const colors = {
  bg: "#0b0d17",
  surface: "#12151f",
  surface2: "#151a26",
  border: "#1f2430",
  text: "#E6E8EC",
  textMuted: "#9AA3B2",
  accent: "#2BC0E4",
  danger: "#ff4d4f",
  success: "#2ee6a6",
};

export const spacing = (n = 1) => 8 * n;

export const text = {
  h1: { fontSize: 28, fontWeight: "700", letterSpacing: 0.5, color: colors.text },
  h2: { fontSize: 20, fontWeight: "600", color: colors.text },
  p: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  button: { fontSize: 16, fontWeight: "600", color: colors.bg },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 6, letterSpacing: 0.4 },
};

