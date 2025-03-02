import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 모바일에서는 @react-native-firebase/messaging를 사용
let messagingInstance = null;
if (Platform.OS !== 'web') {
  try {
    messagingInstance = require('@react-native-firebase/messaging').default;
  } catch (error) {
    console.log("모바일 Firebase Messaging 초기화 오류:", error);
  }
}

export default function EnhancedFeatures() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [webMessagingInitialized, setWebMessagingInitialized] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // 웹에서는 firebase 웹 SDK를 동적으로 가져와서 사용
      (async () => {
        try {
          const firebaseModule = await import('firebase/app');
          await import('firebase/messaging');
          const firebase = firebaseModule.default;
          if (!firebase.apps.length) {
            firebase.initializeApp({
              apiKey: 'YOUR_API_KEY',
              authDomain: 'YOUR_AUTH_DOMAIN',
              projectId: 'YOUR_PROJECT_ID',
              messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
              appId: 'YOUR_APP_ID',
            });
          }
          messagingInstance = firebase.messaging();
          setWebMessagingInitialized(true);
          // 웹 권한 요청
          messagingInstance
            .requestPermission()
            .then(() => {
              console.log('Web: Firebase Messaging 권한 허용됨');
            })
            .catch((error) => {
              console.log("Web 권한 요청 오류:", error);
            });
          messagingInstance.onMessage((payload) => {
            Alert.alert('새로운 웹 알림 도착!', JSON.stringify(payload.notification));
          });
        } catch (error) {
          console.log("Web Firebase Messaging 초기화 오류:", error);
        }
      })();
    } else {
      // 모바일: 권한 요청 및 포그라운드 메시지 리스너 등록
      messagingInstance
        .requestPermission()
        .then((authStatus) => {
          const enabled =
            authStatus === messagingInstance.AuthorizationStatus.AUTHORIZED ||
            authStatus === messagingInstance.AuthorizationStatus.PROVISIONAL;
          if (enabled) {
            console.log('모바일: 권한 상태:', authStatus);
          }
        })
        .catch(error => {
          console.log("모바일 권한 요청 오류:", error);
        });
      const unsubscribe = messagingInstance.onMessage(async (remoteMessage) => {
        Alert.alert('새로운 모바일 알림 도착!', JSON.stringify(remoteMessage.notification));
      });
      return unsubscribe;
    }
  }, []);

  // 예제: 팔로우/친구, 북마크, 게시글 검색 기능 (추후 실제 API 구현 필요)
  const followUser = async (userId) => {
    Alert.alert('팔로우', '사용자를 팔로우했습니다!');
  };

  const bookmarkPost = async (postId) => {
    Alert.alert('북마크', '게시글을 북마크에 저장했습니다!');
  };

  const searchPosts = async (query) => {
    Alert.alert('검색 결과', '검색 기능은 현재 개발 중입니다.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enhanced Features</Text>
      
      <Text style={styles.subHeader}>
        {Platform.OS === 'web'
          ? (webMessagingInitialized ? "Web: 푸시 알림이 설정되었습니다." : "Web: 초기화 중...")
          : "모바일: 푸시 알림이 설정되었습니다."}
      </Text>
      
      {/* 팔로우/친구 기능 */}
      <Button title="사용자 팔로우" onPress={() => followUser('exampleUserId')} />

      {/* 북마크 기능 */}
      <Button title="게시글 북마크" onPress={() => bookmarkPost('examplePostId')} />

      {/* 게시글 검색 기능 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="게시글 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button title="검색" onPress={() => searchPosts(searchQuery)} />
      </View>

      {/* 네비게이션 예시: 홈 화면으로 이동 */}
      <Button title="메인 화면으로 이동" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#fff' 
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  subHeader: { 
    fontSize: 16, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20 
  },
  searchInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 10, 
    marginRight: 10 
  },
});
