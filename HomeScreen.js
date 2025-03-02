import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';
import { ThemeContext } from './ThemeContext';
import { GOOGLE_TRANSLATE_API_KEY } from '@env'; // 환경 변수에서 API 키 불러오기

const sourceLanguage = 'en';
const targetLanguage = 'ko';
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

export default function HomeScreen() {
  const { theme } = useContext(ThemeContext);
  const [original, setOriginal] = useState('');
  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const storedWords = await AsyncStorage.getItem('words');
      if (storedWords) {
        setWords(JSON.parse(storedWords));
      }
    } catch (error) {
      console.error('Failed to load words:', error);
    }
  }

  async function saveWords(newWords) {
    try {
      await AsyncStorage.setItem('words', JSON.stringify(newWords));
      setWords(newWords);
    } catch (error) {
      console.error('Failed to save words:', error);
    }
  }

  // 실제 번역 API 호출 함수
  const translateWord = async (text) => {
    try {
      const response = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.data.translations[0].translatedText;
    } catch (error) {
      Alert.alert('번역 실패', error.message);
      return null;
    }
  };

  async function handleAddWord() {
    if (!original.trim()) {
      Alert.alert('단어를 입력하세요.');
      return;
    }
    const translated = await translateWord(original);
    if (!translated) return;
    const newWord = {
      original,
      translated,
      interval: 1,
      nextReview: new Date().toISOString(),
    };
    const updatedWords = [...words, newWord];
    saveWords(updatedWords);
    setOriginal('');
  }

  function handleDeleteWord(index) {
    const updatedWords = [...words];
    updatedWords.splice(index, 1);
    saveWords(updatedWords);
  }

  const filteredWords = words.filter(word => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      word.original.toLowerCase().includes(lowerQuery) ||
      word.translated.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.homeTitle, { color: theme.headerColor }]}>홈 화면</Text>
      <Text style={[styles.homeSubtitle, { color: theme.textColor }]}>모르는 단어 입력</Text>

      {/* 검색창 */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBackgroundColor,
            color: theme.textColor,
          },
        ]}
        placeholder="검색어 입력"
        placeholderTextColor={theme.placeholderColor}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 단어 추가 영역 */}
      <View style={styles.homeInputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              flex: 1,
              backgroundColor: theme.inputBackgroundColor,
              color: theme.textColor,
            },
          ]}
          placeholder="예: hello"
          placeholderTextColor={theme.placeholderColor}
          value={original}
          onChangeText={setOriginal}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.buttonColor }]}
          onPress={handleAddWord}
        >
          <Text style={[styles.addButtonText, { color: theme.buttonTextColor }]}>추가</Text>
        </TouchableOpacity>
      </View>

      {/* 단어 리스트 */}
      <FlatList
        data={filteredWords}
        keyExtractor={(_, index) => index.toString()}
        style={{ width: '100%' }}
        contentContainerStyle={{ marginTop: 16 }}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.wordRow,
              {
                backgroundColor: theme.cardBackground,
                marginBottom: 6,
              },
            ]}
          >
            <Text style={[styles.wordText, { color: theme.textColor }]}>
              {item.original} → {item.translated}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteWord(index)}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
