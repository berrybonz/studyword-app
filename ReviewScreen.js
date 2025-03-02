import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from './ThemeContext';

export default function ReviewScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [reviewWords, setReviewWords] = useState([]);

  useEffect(() => {
    loadReviewWords();
  }, []);

  async function loadReviewWords() {
    try {
      const storedWords = await AsyncStorage.getItem('words');
      if (storedWords) {
        const wordList = JSON.parse(storedWords);
        const now = new Date();
        const dueWords = wordList.filter(word => new Date(word.nextReview) <= now);
        setReviewWords(dueWords);
      }
    } catch (error) {
      console.log('loadReviewWords Error:', error);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <FlatList
        data={reviewWords}
        keyExtractor={(_, index) => index.toString()}
        style={{ width: '100%' }}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.wordItem, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.wordText, { color: theme.textColor }]}>
              {item.original} ({item.translated})
            </Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.buttonColor }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: theme.buttonTextColor }]}>
          {t('back')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  wordItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  wordText: {
    fontSize: 16,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
