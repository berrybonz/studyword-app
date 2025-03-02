import React, { useState, useEffect, useContext } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Tts from "react-native-tts";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

export default function QuizScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const TOTAL_QUESTIONS = 10;
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [options, setOptions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const storedWords = await AsyncStorage.getItem("words");
      if (storedWords) {
        const wordList = JSON.parse(storedWords);
        setWords(wordList);
        generateQuestion(wordList);
      }
    } catch (error) {
      console.log("loadWords Error:", error);
    }
  }

  function generateQuestion(wordList) {
    const now = new Date();
    const dueWords = wordList.filter(word => new Date(word.nextReview) <= now);
    if (dueWords.length === 0) {
      Alert.alert(t("review"), t("noReviewWords"));
      setCurrentWord(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * dueWords.length);
    const selectedWord = dueWords[randomIndex];
    setCurrentWord(selectedWord);
    setCorrectAnswer(selectedWord.translated);
    let incorrectOptions = wordList
      .filter(word => word.translated !== selectedWord.translated)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(word => word.translated);
    let optionArray = [...incorrectOptions, selectedWord.translated].sort(() => 0.5 - Math.random());
    setOptions(optionArray);
  }

  async function checkAnswer(option) {
    let isCorrect = option === correctAnswer;
    if (isCorrect) {
      setFinalScore(prev => prev + 1);
      const now = new Date();
      const newInterval = currentWord.interval * 2;
      const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
      const updatedWords = words.map(word => {
        if (word.original === currentWord.original && word.translated === currentWord.translated) {
          return { ...word, interval: newInterval, nextReview: nextReview.toISOString() };
        }
        return word;
      });
      setWords(updatedWords);
      await AsyncStorage.setItem("words", JSON.stringify(updatedWords));
    } else {
      const now = new Date();
      const newInterval = 1;
      const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
      const updatedWords = words.map(word => {
        if (word.original === currentWord.original && word.translated === currentWord.translated) {
          return { ...word, interval: newInterval, nextReview: nextReview.toISOString() };
        }
        return word;
      });
      setWords(updatedWords);
      await AsyncStorage.setItem("words", JSON.stringify(updatedWords));
    }

    if (questionNumber >= TOTAL_QUESTIONS) {
      setQuizCompleted(true);
    } else {
      setQuestionNumber(prev => prev + 1);
      generateQuestion(words);
    }
  }

  function speakWord() {
    if (currentWord) {
      Tts.speak(currentWord.original);
    }
  }

  if (quizCompleted) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.inner}>
          <Text style={[styles.header, { color: theme.headerColor }]}>{t("quizCompleted")}</Text>
          <Text style={[styles.score, { color: theme.textColor }]}>{t("finalScore")}: {finalScore} / {TOTAL_QUESTIONS}</Text>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backButtonText, { color: theme.buttonTextColor }]}>{t("back")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.inner}>
        <Text style={[styles.header, { color: theme.headerColor }]}>{t("quiz")} ({questionNumber}/{TOTAL_QUESTIONS})</Text>
        {currentWord ? (
          <>
            <Text style={[styles.question, { color: theme.textColor }]}>{t("whatIsTheMeaning")}</Text>
            <Text style={[styles.word, { color: theme.textColor }]}>{currentWord.original}</Text>
            <TouchableOpacity style={[styles.ttsButton, { backgroundColor: "#03A9F4" }]} onPress={speakWord}>
              <Text style={[styles.ttsButtonText, { color: "#fff" }]}>{t("listen")}</Text>
            </TouchableOpacity>
            {options.map((option, index) => (
              <TouchableOpacity key={index} style={[styles.optionButton, { backgroundColor: theme.cardBackground || "#fff" }]} onPress={() => checkAnswer(option)}>
                <Text style={[styles.optionText, { color: theme.textColor }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Text style={{ color: theme.textColor }}>{t("noReviewWords")}</Text>
        )}
        <Text style={[styles.score, { color: theme.textColor }]}>{t("currentScore")}: {finalScore}</Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, { color: theme.buttonTextColor }]}>{t("back")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20, alignItems: "center" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  question: { fontSize: 20, marginBottom: 10 },
  word: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  ttsButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginBottom: 10 },
  ttsButtonText: { fontWeight: "bold" },
  optionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  optionText: { fontSize: 16 },
  score: { fontSize: 18, marginVertical: 15, fontWeight: "bold" },
  backButton: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  backButtonText: { fontWeight: "bold" },
});
