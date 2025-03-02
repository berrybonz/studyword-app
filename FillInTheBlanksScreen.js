import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from "./ThemeContext";

export default function FillInTheBlanksScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const storedWords = await AsyncStorage.getItem('words');
      if (storedWords) {
        const wordList = JSON.parse(storedWords);
        setWords(wordList);
        setCurrentWord(wordList[Math.floor(Math.random() * wordList.length)]);
      }
    } catch (error) {
      console.error('Error loading words:', error);
    }
  }

  const checkAnswer = () => {
    if (!currentWord) return;
    if (userInput.trim().toLowerCase() === currentWord.translated.toLowerCase()) {
      setScore(score + 1);
      Alert.alert(t('success'), t('correctAnswer'));
    } else {
      Alert.alert(t('error'), t('wrongAnswer'));
    }
    setUserInput('');
    setCurrentWord(words[Math.floor(Math.random() * words.length)]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.header, { color: theme.headerColor }]}>{t('fillInTheBlanks')}</Text>
      {currentWord ? (
        <>
          <Text style={[styles.question, { color: theme.textColor }]}>{t('translateThis')}: {currentWord.original}</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.buttonColor, backgroundColor: theme.inputBackgroundColor || "#fff", color: theme.textColor }]}
            placeholder={t('enterTranslation')}
            placeholderTextColor={theme.placeholderColor || "#888"}
            value={userInput}
            onChangeText={setUserInput}
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={checkAnswer}>
            <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t('submit')}</Text>
          </TouchableOpacity>
          <Text style={[styles.score, { color: theme.textColor }]}>{t('currentScore')}: {score}</Text>
        </>
      ) : (
        <Text style={{ color: theme.textColor }}>{t('noWordsFound')}</Text>
      )}
      <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.backButtonText, { color: theme.buttonTextColor }]}>{t('back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  question: { fontSize: 18, marginBottom: 10 },
  input: { width: '100%', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 20 },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20, width: '100%' },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  score: { fontSize: 18, marginBottom: 20 },
  backButton: { marginTop: 20, padding: 15, borderRadius: 8, alignItems: 'center', width: '100%' },
  backButtonText: { fontSize: 16, fontWeight: 'bold' },
});
