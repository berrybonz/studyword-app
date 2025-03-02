import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  FlatList,
  ScrollView,
  Modal,
  Pressable
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { db } from './firebaseConfig';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  query as firestoreQuery,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { AuthContext } from './App';
import { ThemeContext } from './ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SocialPostScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { postId, isNew } = route.params || {};
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // 게시글 상태
  const [content, setContent] = useState('');
  const [likes, setLikes] = useState([]);
  const [post, setPost] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  // 댓글 상태 (평면 구조)
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 자동완성 관련 상태
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 모달 메뉴 상태
  const [menuVisible, setMenuVisible] = useState(false);

  const storage = getStorage();

  // ================================
  // 1. 신규 게시글 작성 모드 (isNew=true)
  // ================================
  async function handleCreatePost() {
    if (!user) {
      Alert.alert(t('error'), t('loginRequired'));
      return;
    }
    if (!content.trim()) {
      Alert.alert(t('error'), "내용을 입력하세요.");
      return;
    }
    let finalImageUrl = null;
    if (imageUri) {
      finalImageUrl = await uploadImage(imageUri);
      if (!finalImageUrl) {
        Alert.alert(t('error'), "이미지 업로드에 실패했습니다.");
        return;
      }
    }
    try {
      await addDoc(collection(db, 'posts'), {
        content: content.trim(),
        author: user.displayName || 'Anonymous',
        authorUid: user.uid,
        imageUrl: finalImageUrl,
        likes: [],
        timestamp: serverTimestamp(),
      });
      Alert.alert(t('success'), "게시글이 등록되었습니다.");
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  }

  // ================================
  // 2. 기존 게시글 모드: 게시글 불러오기
  // ================================
  useEffect(() => {
    if (!isNew && postId) {
      const docRef = doc(db, 'posts', postId);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPost({ id: docSnap.id, ...data });
            setContent(data.content);
            setLikes(data.likes || []);
          }
        })
        .catch((error) => Alert.alert(t('error'), error.message));
    }
  }, [postId, isNew, t]);

  // ================================
  // 3. 댓글 불러오기 (평면 구조)
  // ================================
  useEffect(() => {
    if (postId && !isNew) {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
        let list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setComments(list);
      }, (error) => {
        Alert.alert(t('error'), error.message);
      });
      return () => unsubscribe();
    }
  }, [postId, isNew, t]);

  // ================================
  // 4. 이미지 선택 및 업로드
  // ================================
  async function attachImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t('error'), "Permission to access camera roll is required!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    // Expo SDK 버전에 따라 result.cancelled 또는 result.canceled를 사용하세요.
    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  }

  async function uploadImage(uri) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `postImages/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      Alert.alert(t('error'), error.message);
      return null;
    }
  }

  // ================================
  // 5. 기존 게시글 관련 기능
  // ================================
  function handleNavigateToEdit() {
    navigation.navigate('EditPostScreen', { postId });
  }

  async function handleDeletePost() {
    if (!post || !postId) {
      Alert.alert(t('error'), "삭제할 게시물을 찾을 수 없습니다.");
      return;
    }
    if (user.uid !== post.authorUid) {
      Alert.alert(t('error'), "본인 게시글만 삭제할 수 있습니다.");
      return;
    }
    Alert.alert(t('delete'), t('delete') + '?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        onPress: async () => {
          try {
            const postRef = doc(db, 'posts', postId);
            await deleteDoc(postRef);
            Alert.alert(t('success'), t('delete'));
            navigation.goBack();
          } catch (error) {
            Alert.alert(t('error'), error.message);
          }
        },
      },
    ]);
  }

  async function handleLike() {
    if (!user) {
      Alert.alert(t('error'), t('loginRequired'));
      return;
    }
    const postRef = doc(db, 'posts', postId);
    const uid = user.uid;
    const alreadyLiked = likes.includes(uid);
    try {
      if (alreadyLiked) {
        await updateDoc(postRef, { likes: arrayRemove(uid) });
        setLikes((prev) => prev.filter((id) => id !== uid));
      } else {
        await updateDoc(postRef, { likes: arrayUnion(uid) });
        setLikes((prev) => [...prev, uid]);
      }
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  }

  // ================================
  // 6. 댓글 추가 및 삭제 (평면 구조, 자동완성 태그 포함)
  // ================================
  const handleCommentChange = async (text) => {
    setNewComment(text);
    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      const searchText = mentionMatch[1];
      if (searchText.length > 0) {
        const usersRef = collection(db, 'users');
        const q = firestoreQuery(
          usersRef,
          where('displayName', '>=', searchText),
          where('displayName', '<=', searchText + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        const result = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          result.push({ id: docSnap.id, displayName: data.displayName });
        });
        setSuggestions(result);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    const newText = newComment.replace(/@(\w*)$/, `@${suggestion.displayName} `);
    setNewComment(newText);
    setShowSuggestions(false);
  };

  async function handleAddComment() {
    if (!newComment.trim()) {
      Alert.alert(t('error'), t('enterComment') || "Enter your comment");
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
      Alert.alert(t('error'), t('notYourComment') || "This is not your comment");
      return;
    }
    try {
      const commentDoc = doc(db, 'posts', postId, 'comments', commentId);
      await deleteDoc(commentDoc);
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  }

  // ================================
  // 7. 댓글 렌더링 (평면 구조)
  // ================================
  const renderComment = ({ item }) => {
    return (
      <View style={[styles.commentItem, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.commentAuthor, { color: theme.textColor }]}>{item.author}</Text>
        <Text style={[styles.commentContent, { color: theme.textColor }]}>{item.content}</Text>
        <View style={styles.commentActions}>
          {user && user.uid === item.uid && (
            <TouchableOpacity onPress={() => handleDeleteComment(item.id, item.uid)}>
              <Text style={[styles.commentActionText, { color: theme.buttonColor }]}>{t('delete')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // 신고 기능
  function handleReport() {
    Alert.alert(t('report'), t('reportSubmitted') || "Report submitted");
  }

  // 모달 메뉴
  const renderMenu = () => (
    <Modal
      animationType="fade"
      transparent
      visible={menuVisible}
      onRequestClose={() => setMenuVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); handleNavigateToEdit(); }}>
            <Text style={[styles.menuText, { color: theme.textColor }]}>{t('edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); handleDeletePost(); }}>
            <Text style={[styles.menuText, { color: theme.textColor }]}>{t('delete')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); Alert.alert(t('share'), t('shareMessage')); }}>
            <Text style={[styles.menuText, { color: theme.textColor }]}>{t('share')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); handleReport(); }}>
            <Text style={[styles.menuText, { color: theme.textColor }]}>{t('report')}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  // ================================
  // 렌더링: 신규 게시글 작성 모드 vs 기존 게시글 모드
  // ================================
  if (isNew) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.header, { color: theme.headerColor }]}>{t('createNewPost')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackgroundColor, color: theme.textColor }]}
          placeholder={t('enterContent') || "내용을 입력하세요."}
          placeholderTextColor={theme.placeholderColor}
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity
          style={[styles.pickImageButton, { backgroundColor: theme.buttonColor }]}
          onPress={attachImage}
        >
          <Text style={{ color: theme.buttonTextColor }}>{t('pickImage') || "이미지 선택"}</Text>
        </TouchableOpacity>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        )}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.buttonColor }]}
          onPress={handleCreatePost}
        >
          <Text style={{ color: theme.buttonTextColor }}>{t('submit') || "등록"}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
          <Text style={[styles.likeText, { color: theme.buttonColor }]}>
            ♥ {t('like')} ({likes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Text style={[styles.menuButtonText, { color: theme.headerColor }]}>⋮</Text>
        </TouchableOpacity>
      </View>
      {renderMenu()}
      <View style={styles.postContainer}>
        {post && post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
        )}
        <Text style={[styles.postContent, { color: theme.textColor }]}>{content}</Text>
      </View>
      <Text style={[styles.commentsHeader, { color: theme.headerColor }]}>{t('comments')}</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        style={{ width: '100%' }}
      />
      <View style={styles.commentInputContainer}>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={[styles.commentInput, { backgroundColor: theme.inputBackgroundColor, color: theme.textColor }]}
            placeholder={t('enterComment') || "Enter your comment"}
            placeholderTextColor={theme.placeholderColor}
            value={newComment}
            onChangeText={handleCommentChange}
          />
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectSuggestion(item)}
                    style={styles.suggestionItem}
                  >
                    <Text style={{ color: theme.textColor }}>{item.displayName}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
        <TouchableOpacity style={[styles.commentSubmitButton, { backgroundColor: theme.buttonColor }]} onPress={handleAddComment}>
          <Text style={[styles.commentSubmitButtonText, { color: theme.buttonTextColor }]}>{t('submit')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  pickImageButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  likeButton: { marginRight: 16 },
  likeText: { fontSize: 16, fontWeight: 'bold' },
  menuButton: { padding: 8 },
  menuButtonText: { fontSize: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', borderRadius: 8, padding: 16 },
  menuItem: { paddingVertical: 12 },
  menuText: { fontSize: 16 },
  postContainer: { marginBottom: 20 },
  postImage: { width: '100%', height: 300, borderRadius: 8, marginBottom: 12 },
  postContent: { fontSize: 16 },
  commentsHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  commentInputContainer: { width: '100%', marginTop: 16 },
  commentInput: { height: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  commentSubmitButton: { width: 80, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  commentSubmitButtonText: { fontSize: 16, fontWeight: 'bold' },
  commentItem: { padding: 12, borderRadius: 8, marginBottom: 8 },
  commentAuthor: { fontWeight: 'bold', marginBottom: 4 },
  commentContent: { marginBottom: 6 },
  commentActions: { flexDirection: 'row', justifyContent: 'flex-start' },
  commentActionText: { marginRight: 12, fontSize: 14 },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 10,
    maxHeight: 100,
  },
  suggestionItem: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

