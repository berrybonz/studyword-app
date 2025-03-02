import React, { useContext } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeContext } from "./ThemeContext";
import { useTranslation } from "react-i18next";

export default function ThemeSettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <View style={styles.inner}>
        <Text style={[styles.header, { color: theme.headerColor }]}>{t("themeSettings")}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => toggleTheme("light")}>
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t("lightMode")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => toggleTheme("dark")}>
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t("darkMode")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t("back")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inner: { padding: 16, justifyContent: "center" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});
