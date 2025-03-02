import React, { useContext } from "react";
import { SafeAreaView, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { AuthContext } from "./App"; // 실제 AuthContext 경로에 맞게 수정
import { getAuth, signOut } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

export default function SettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const auth = getAuth();

  async function logout() {
    try {
      await signOut(auth);
      Alert.alert(t("logout"));
    } catch (error) {
      Alert.alert(t("logout"), t("failed") + ": " + error.message);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* 사용자 정보 */}
      {user ? (
        <Text style={[styles.userInfo, { color: theme.textColor }]}>
          {t("currentUser")}: {user.email}
        </Text>
      ) : (
        <Text style={[styles.userInfo, { color: theme.textColor }]}>{t("notLoggedIn")}</Text>
      )}

      {/* 로그아웃 버튼 */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonColor }]}
        onPress={logout}
      >
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t("logout")}</Text>
      </TouchableOpacity>

      {/* 언어 설정 화면 이동 */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonColor }]}
        onPress={() => navigation.navigate("LanguageSettings")}
      >
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t("languageSetting")}</Text>
      </TouchableOpacity>

      {/* 통계 화면 이동 */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonColor }]}
        onPress={() => navigation.navigate("StatisticsScreen")}
      >
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t("statistics")}</Text>
      </TouchableOpacity>

      {/* 테마 설정 화면 이동 */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonColor }]}
        onPress={() => navigation.navigate("ThemeSettings")}
      >
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t("themeSettings")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
