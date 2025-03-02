import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from "./ThemeContext";

export default function MatchingGameScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [wordsToMatch, setWordsToMatch] = useState([]);
  const [originals, setOriginals] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [selectedOriginal, setSelectedOriginal] = useState(null);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const storedWords = await AsyncStorage.getItem('words');
      if (storedWords) {
        const wordList = JSON.parse(storedWords);
        const shuffled = shuffleArray(wordList);
        const selected = shuffled.slice(0, 10);
        setWordsToMatch(selected);
        setScore(selected.length);
        setOriginals(selected.map(word => word.original));
        setTranslations(shuffleArray(selected.map(word => word.translated)));
      }
    } catch (error) {
      console.error('Error loading words:', error);
    }
  }

  function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  const handleSelectOriginal = (word) => {
    setSelectedOriginal(word);
    if (selectedTranslation !== null) {
      checkMatch(word, selectedTranslation);
    }
  };

  const handleSelectTranslation = (word) => {
    setSelectedTranslation(word);
    if (selectedOriginal !== null) {
      checkMatch(selectedOriginal, word);
    }
  };

  const checkMatch = (original, translation) => {
    const correctTranslation = wordsToMatch.find(word => word.original === original)?.translated;

    if (correctTranslation === translation) {
      const updated = wordsToMatch.filter(word => !(word.original === original && word.translated === translation));
      setWordsToMatch(updated);
      const newOriginals = updated.map(word => word.original);
      const newTranslations = shuffleArray(updated.map(word => word.translated));
      setOriginals(newOriginals);
      setTranslations(newTranslations);
      Alert.alert(t('success'), t('correctMatch'));
      if (updated.length === 0) {
        Alert.alert(t('quizCompleted'), `${t('finalScore')}: ${score}`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } else {
      setScore(prev => prev - 1);
      Alert.alert(t('error'), t('wrongMatch'));
    }
    setSelectedOriginal(null);
    setSelectedTranslation(null);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.header, { color: theme.headerColor }]}>{t('matchingGame')}</Text>
      <Text style={[styles.subHeader, { color: theme.textColor }]}>{t('selectPair')}</Text>
      <Text style={[styles.scoreText, { color: theme.headerColor }]}>{t('currentScore')}: {score}</Text>
      <View style={styles.rowContainer}>
        <View style={styles.column}>
          {originals.map((item, index) => (
            <TouchableOpacity
              key={`original-${index}`}
              style={[
                styles.item,
                { borderColor: theme.buttonColor },
                selectedOriginal === item && { backgroundColor: theme.buttonColor }
              ]}
              onPress={() => handleSelectOriginal(item)}
            >
              <Text style={[styles.itemText, { color: selectedOriginal === item ? theme.buttonTextColor : theme.textColor }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.column}>
          {translations.map((item, index) => (
            <TouchableOpacity
              key={`translation-${index}`}
              style={[
                styles.item,
                { borderColor: theme.buttonColor },
                selectedTranslation === item && { backgroundColor: theme.buttonColor }
              ]}
              onPress={() => handleSelectTranslation(item)}
            >
              <Text style={[styles.itemText, { color: selectedTranslation === item ? theme.buttonTextColor : theme.textColor }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.backButtonText, { color: theme.buttonTextColor }]}>{t('back')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, marginBottom: 10 },
  scoreText: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 0.45 },
  item: { padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  itemText: { fontSize: 16 },
  backButton: { marginTop: 20, padding: 15, borderRadius: 8, alignItems: 'center' },
  backButtonText: { fontSize: 16, fontWeight: 'bold' },
});
