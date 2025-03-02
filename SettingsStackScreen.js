import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SettingsScreen from "./SettingsScreen";
import LanguageSettingsScreen from "./LanguageSettingsScreen";
import StatisticsScreen from "./StatisticsScreen";
import ThemeSettingsScreen from "./ThemeSettingsScreen";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

const SettingsStack = createStackNavigator();

export default function SettingsStackScreen() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.headerBackgroundColor },
        headerTintColor: theme.headerColor,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: t("settings") }}
      />
      <SettingsStack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{ title: t("languageSetting") }}
      />
      <SettingsStack.Screen
        name="StatisticsScreen"
        component={StatisticsScreen}
        options={{ title: t("statistics") }}
      />
      <SettingsStack.Screen
        name="ThemeSettings"
        component={ThemeSettingsScreen}
        options={{ title: t("themeSettings") }}
      />
    </SettingsStack.Navigator>
  );
}
