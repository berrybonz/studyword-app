import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { db } from './firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { AuthContext } from './App';
import { ThemeContext } from './ThemeContext';

export default function UserProfileScreen({ route, navigation }) {
  const { uid } = route.params; // 소셜 스크린에서 넘긴 uid
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('UserProfileScreen uid:', uid); // 디버깅: uid 출력
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User doc data:', data); // 디버깅: 문서 내용 출력
          setProfileData(data);
          
          if (data.followers && user && data.followers.includes(user.uid)) {
            setIsFollowing(true);
          }
        } else {
          Alert.alert('Error', '존재하지 않는 사용자입니다.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    if (user && uid) {
      fetchUser();
    } else {
      Alert.alert('Error', '로그인 정보 또는 UID가 유효하지 않습니다.');
      navigation.goBack();
    }
  }, [uid, user]);

  const handleFollow = async () => {
    if (!user) {
      Alert.alert('Error', '로그인이 필요합니다.');
      return;
    }
    try {
      const userRef = doc(db, 'users', uid);
      const myRef = doc(db, 'users', user.uid);
      if (isFollowing) {
        await updateDoc(userRef, { followers: arrayRemove(user.uid) });
        await updateDoc(myRef, { following: arrayRemove(uid) });
        setIsFollowing(false);
      } else {
        await updateDoc(userRef, { followers: arrayUnion(user.uid) });
        await updateDoc(myRef, { following: arrayUnion(uid) });
        setIsFollowing(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (!profileData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={{ color: theme.textColor }}>Loading...</Text>
      </View>
    );
  }

  const isMyProfile = user && (user.uid === uid);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Image
        source={{ uri: profileData.photoURL || 'https://placekitten.com/100/100' }}
        style={styles.profileImage}
      />
      <Text style={[styles.displayName, { color: theme.textColor }]}>
        {profileData.displayName || 'No Name'}
      </Text>
      <View style={styles.followRow}>
        <Text style={[styles.followText, { color: theme.textColor }]}>
          팔로워 {profileData.followers ? profileData.followers.length : 0}
        </Text>
        <Text style={[styles.followText, { color: theme.textColor }]}>
          팔로잉 {profileData.following ? profileData.following.length : 0}
        </Text>
      </View>
      {isMyProfile ? (
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.buttonColor }]}
          onPress={() => navigation.navigate('ProfileStack', { screen: 'EditProfileScreen' })}
        >
          <Text style={[styles.editButtonText, { color: theme.buttonTextColor }]}>프로필 수정</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.followButton, { backgroundColor: theme.buttonColor }]}
          onPress={handleFollow}
        >
          <Text style={[styles.followButtonText, { color: theme.buttonTextColor }]}>
            {isFollowing ? '언팔로우' : '팔로우'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  displayName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  followRow: { flexDirection: 'row', justifyContent: 'space-around', width: '60%', marginVertical: 10 },
  followText: { fontSize: 16 },
  editButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 20 },
  editButtonText: { fontWeight: 'bold' },
  followButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 20 },
  followButtonText: { fontWeight: 'bold' },
});
