import React, { useContext } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from './ThemeContext';

export default function LearningModesScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <View style={styles.inner}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.navigate('MatchingGameScreen')}>
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t('matchingGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.navigate('FillInTheBlanksScreen')}>
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t('fillInTheBlanks')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.navigate('QuizScreen')}>
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t('quiz')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor, marginTop: 20 }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t('back')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inner: { padding: 16, justifyContent: 'center' },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
});
