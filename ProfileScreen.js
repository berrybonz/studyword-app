import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { AuthContext } from "./App";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const auth = getAuth();
  const [displayName, setDisplayName] = useState(user ? user.displayName || "" : "");
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      fetchUserData();
    }
  }, [user]);

  async function fetchUserData() {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFollowersCount(data.followers ? data.followers.length : 0);
        setFollowingCount(data.following ? data.following.length : 0);
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  }

  async function updateUserProfile() {
    try {
      await updateProfile(auth.currentUser, { displayName });
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      setDisplayName(auth.currentUser.displayName);
      Alert.alert(t("updateProfile"), t("updateProfile") + " " + t("success"));
    } catch (error) {
      console.log("프로필 업데이트 에러:", error);
      Alert.alert(t("updateProfile"), t("updateProfile") + " " + t("failed") + ": " + error.message);
    }
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.header, { color: theme.headerColor }]}>{t("login")} {t("required")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Image
        source={{ uri: user.photoURL || 'https://placekitten.com/100/100' }}
        style={styles.profileImage}
      />
      <Text style={[styles.header, { color: theme.headerColor }]}>{t("profile")}</Text>
      <Text style={[styles.label, { color: theme.textColor }]}>{t("email")}: {user.email}</Text>

      <View style={styles.followRow}>
        <Text style={[styles.followText, { color: theme.textColor }]}>
          팔로워 {followersCount}
        </Text>
        <Text style={[styles.followText, { color: theme.textColor }]}>
          팔로잉 {followingCount}
        </Text>
      </View>

      <Text style={[styles.label, { color: theme.textColor }]}>{t("name")}:</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackgroundColor, color: theme.textColor }]}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder={t("name")}
        placeholderTextColor={theme.placeholderColor}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={updateUserProfile}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t("updateProfile")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: theme.buttonColor }]}
        onPress={() => navigation.navigate('EditProfileScreen')}
      >
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>프로필 수정</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  profileImage: {
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 16
  },
  header: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  label: { 
    fontSize: 16, 
    marginBottom: 10 
  },
  followRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 20
  },
  followText: {
    fontSize: 16
  },
  input: { 
    width: "80%", 
    height: 50, 
    borderColor: "gray", 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 15 
  },
  button: { 
    width: "80%", 
    paddingVertical: 15, 
    borderRadius: 8, 
    alignItems: "center", 
    marginBottom: 10 
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  editButton: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10
  }
});
