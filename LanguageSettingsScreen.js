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

  // 게시글 관련 상태 (읽기 전용)
  const [content, setContent] = useState('');
  const [likes, setLikes] = useState([]);
  const [post, setPost] = useState(null);
  const [imageUri, setImageUri] = useState(null); // 첨부 이미지 URI (수정 시 활용)

  // 댓글 관련 상태
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null); // 대댓글 달 대상 댓글 id

  // 모달 메뉴 상태
  const [menuVisible, setMenuVisible] = useState(false);

  const storage = getStorage();

  // 게시글 불러오기 (상세 모드)
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

  // 댓글 불러오기 (모든 댓글, 대댓글 포함)
  useEffect(() => {
    if (postId) {
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
  }, [postId, t]);

  // 이미지 선택 함수 (수정 시 활용)
  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t('error'), "Permission to access camera roll is required!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  }

  // Firebase Storage에 이미지 업로드 후 URL 반환
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

  // 게시글 상세 화면에서는 편집은 따로 EditPostScreen으로 이동하도록 함
  function handleNavigateToEdit() {
    navigation.navigate('EditPostScreen', { postId });
  }

  async function handleDeletePost() {
    if (!post || !postId) {
      Alert.alert(t('error'), '삭제할 게시물을 찾을 수 없습니다.');
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

  // 댓글 추가 (대댓글 지원)
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
        parentId: replyTo ? replyTo : null,
      });
      setNewComment('');
      setReplyTo(null);
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

  // 댓글 렌더링 – 대댓글은 indent 처리
  const renderComment = ({ item }) => {
    return (
      <View style={[styles.commentItem, { backgroundColor: theme.cardBackground, marginLeft: item.parentId ? 20 : 0 }]}>
        <Text style={[styles.commentAuthor, { color: theme.textColor }]}>{item.author}</Text>
        <Text style={[styles.commentContent, { color: theme.textColor }]}>{item.content}</Text>
        <View style={styles.commentActions}>
          {user && (
            <TouchableOpacity onPress={() => setReplyTo(item.id)}>
              <Text style={[styles.commentActionText, { color: theme.buttonColor }]}>{t('reply') || "Reply"}</Text>
            </TouchableOpacity>
          )}
          {user && user.uid === item.uid && (
            <TouchableOpacity onPress={() => handleDeleteComment(item.id, item.uid)}>
              <Text style={[styles.commentActionText, { color: theme.buttonColor }]}>{t('delete')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // 모달 메뉴 (상단 우측 ⋮ 버튼)
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

  // handleReport 함수 정의
  function handleReport() {
    Alert.alert(t('report'), t('reportSubmitted') || "Report submitted");
  }

  // 상세 화면은 읽기 전용 게시글 내용과 댓글 기능을 모두 포함하는 ScrollView로 구성
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* 상단 메뉴 버튼 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Text style={[styles.menuButtonText, { color: theme.headerColor }]}>⋮</Text>
        </TouchableOpacity>
      </View>
      {renderMenu()}
      
      {/* 게시글 내용 */}
      <View style={styles.postContainer}>
        {post && post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
        )}
        <Text style={[styles.postContent, { color: theme.textColor }]}>{content}</Text>
      </View>
      
      {/* 댓글 제목 */}
      <Text style={[styles.commentsHeader, { color: theme.headerColor }]}>{t('comments')}</Text>
      
      {/* 댓글 목록 */}
      <FlatList
        data={comments.filter(c => !c.parentId)}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        style={{ width: '100%' }}
      />
      
      {/* 댓글 입력 영역 */}
      <View style={styles.commentInputContainer}>
        {replyTo && (
          <View style={styles.replyBanner}>
            <Text style={{ color: theme.textColor }}>{t('replyingTo') || "Replying to comment"}</Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={{ color: theme.buttonColor }}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={[styles.commentInput, { backgroundColor: theme.inputBackgroundColor, color: theme.textColor }]}
          placeholder={t('enterComment') || "Enter your comment"}
          placeholderTextColor={theme.placeholderColor}
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={[styles.commentSubmitButton, { backgroundColor: theme.buttonColor }]} onPress={handleAddComment}>
          <Text style={[styles.commentSubmitButtonText, { color: theme.buttonTextColor }]}>{t('submit')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end' },
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
  replyBanner: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#eee', padding: 8, borderRadius: 4, marginBottom: 8 },
});
