import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { db } from './firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from './App';
import { ThemeContext } from './ThemeContext';

export default function EditPostScreen({ route, navigation }) {
  const { postId } = route.params;
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content);
        }
      } catch (error) {
        Alert.alert(t('error'), error.message);
      }
    };
    fetchPost();
  }, [postId, t]);

  const handleUpdate = async () => {
    if (!content.trim()) {
      Alert.alert(t('error'), t('enterWord'));
      return;
    }
    try {
      const docRef = doc(db, 'posts', postId);
      await updateDoc(docRef, { content, timestamp: serverTimestamp() });
      Alert.alert(t('success'), t('updateProfile'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <TextInput
        style={[styles.input, { borderColor: theme.buttonColor, backgroundColor: theme.inputBackgroundColor, color: theme.textColor }]}
        value={content}
        onChangeText={setContent}
        multiline
        placeholder={t('enterWord')}
        placeholderTextColor={theme.placeholderColor}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={handleUpdate}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t('submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: { minHeight: 150, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 16 },
  button: { paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
});