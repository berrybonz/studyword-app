import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { db } from './firebaseConfig';
import { collection, addDoc, doc, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ThemeContext } from './ThemeContext';
import { AuthContext } from './App';

export default function SocialCommentsScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { postId } = route.params || {};
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!postId) return;
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setComments(list);
    }, (error) => {
      Alert.alert(t('error'), error.message);
    });
    return () => unsubscribe();
  }, [postId, t]);

  async function handleAddComment() {
    if (!newComment.trim()) {
      Alert.alert(t('error'), t('enterComment'));
      return;
    }
    if (!user) {
      Alert.alert(t('error'), t('loginRequired'));
      return;
    }
    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, {
        content: newComment,
        author: user.displayName || 'Anonymous',
        uid: user.uid,
        timestamp: serverTimestamp(),
      });
      setNewComment('');
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  }

  async function handleDeleteComment(commentId, commentUid) {
    if (!user) return;
    if (commentUid !== user.uid) {
      Alert.alert(t('error'), t('notYourComment'));
      return;
    }
    try {
      const commentDoc = doc(db, 'posts', postId, 'comments', commentId);
      await deleteDoc(commentDoc);
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  }

  const renderItem = ({ item }) => (
    <View style={[styles.commentItem, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.commentAuthor, { color: theme.textColor }]}>{item.author}</Text>
      <Text style={[styles.commentContent, { color: theme.textColor }]}>{item.content}</Text>
      {user && user.uid === item.uid && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteComment(item.id, item.uid)}>
          <Text style={styles.deleteButtonText}>🗑 {t('delete')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        style={{ width: '100%' }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackgroundColor, color: theme.textColor }]}
          placeholder={t('enterComment')}
          placeholderTextColor={theme.placeholderColor}
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.buttonColor }]} onPress={handleAddComment}>
          <Text style={[styles.addButtonText, { color: theme.buttonTextColor }]}>{t('submit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  commentItem: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
  },
  commentAuthor: { fontWeight: 'bold', marginBottom: 4 },
  commentContent: { marginBottom: 6 },
  deleteButton: { backgroundColor: '#ff5555', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', marginTop: 10 },
  input: { flex: 1, height: 48, borderRadius: 8, paddingHorizontal: 12, marginRight: 8 },
  addButton: { width: 80, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { fontWeight: 'bold' },
});
