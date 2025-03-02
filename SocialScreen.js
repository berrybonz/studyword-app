import React, { useState, useEffect, useLayoutEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { ThemeContext } from './ThemeContext';
import { AuthContext } from './App';
import { useNavigation } from '@react-navigation/native';

export default function SocialScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const nav = useNavigation();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let postsArr = [];
      querySnapshot.forEach((doc) => {
        postsArr.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsArr);
    }, error => {
      Alert.alert(t('error'), error.message);
    });
    return () => unsubscribe();
  }, [t]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('SocialPostScreen', { isNew: true })}
          style={styles.headerButton}
        >
          <Text style={[styles.headerButtonText, { color: theme.headerColor }]}>＋</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  const renderItem = ({ item }) => {
    // 디버깅: 게시글에 저장된 authorUid 출력
    console.log('Post authorUid:', item.authorUid);
    
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.cardBackground }]}
        onPress={() => {
          navigation.navigate('SocialPostScreen', { postId: item.id });
        }}
      >
        {/* 작성자 프로필 영역 */}
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => {
            // authorUid가 반드시 존재해야 함.
            if (!item.authorUid) {
              Alert.alert('Error', '작성자 UID가 없습니다.');
              return;
            }
            console.log('Navigating to UserProfileScreen with uid:', item.authorUid);
            nav.navigate('UserProfileScreen', { uid: item.authorUid });
          }}
        >
          <Image
            source={{ uri: item.authorPhotoURL || 'https://placekitten.com/80/80' }}
            style={styles.profileImage}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.authorName, { color: theme.textColor }]}>{item.author}</Text>
            <Text style={[styles.timestamp, { color: theme.textColor }]}>
              {new Date(item.timestamp?.toDate?.() || Date.now()).toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        <Text style={[styles.content, { color: theme.textColor }]}>{item.content}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SocialPostScreen', { postId: item.id })}>
            <Text style={[styles.actionText, { color: theme.buttonColor }]}>
              ♥ {item.likes ? item.likes.length : 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SocialCommentsScreen', { postId: item.id })}>
            <Text style={[styles.actionText, { color: theme.buttonColor }]}>{t('comments')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerButton: { marginRight: 15 },
  headerButtonText: { fontSize: 30 },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  profileImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc' },
  authorName: { fontWeight: 'bold', fontSize: 16 },
  timestamp: { fontSize: 12, opacity: 0.7 },
  postImage: { width: '100%', height: 300, borderRadius: 8, marginBottom: 8 },
  content: { fontSize: 14, marginBottom: 8 },
  actionRow: { flexDirection: 'row' },
  actionButton: { marginRight: 16 },
  actionText: { fontSize: 16, fontWeight: 'bold' },
});
