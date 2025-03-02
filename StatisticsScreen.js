import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [wordCount, setWordCount] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const storedWords = await AsyncStorage.getItem("words");
        if (storedWords) {
          const words = JSON.parse(storedWords);
          setWordCount(words.length);
        }
      } catch (error) {
        console.log("fetchWords error:", error);
      }
    };
    fetchWords();
  }, []);

  const level = Math.floor(wordCount / 5);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.headerColor }]}>{t("statistics")}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>{t("totalWords")}: {wordCount}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>{t("quizScore")}: {quizScore}</Text>
      <Text style={[styles.text, { color: theme.textColor }]}>{t("level")}: {level}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  text: { 
    fontSize: 18, 
    marginBottom: 10 
  },
});
