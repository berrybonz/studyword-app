import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemeContext } from './ThemeContext';
import { useTranslation } from 'react-i18next';
import { getAuth, updateProfile } from 'firebase/auth';

export default function EditProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const auth = getAuth();
  const [displayName, setDisplayName] = useState(auth.currentUser ? auth.currentUser.displayName : '');

  async function handleUpdateProfile() {
    try {
      await updateProfile(auth.currentUser, { displayName });
      Alert.alert(t("updateProfile"), t("updateProfile") + " " + t("success"));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t("updateProfile"), t("updateProfile") + " " + t("failed") + ": " + error.message);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.header, { color: theme.headerColor }]}>{t("Edit Profile")}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackgroundColor, color: theme.textColor }]}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder={t("name")}
        placeholderTextColor={theme.placeholderColor}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={handleUpdateProfile}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>{t("Save")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: { width: "80%", height: 50, borderColor: "gray", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 15 },
  button: { width: "80%", paddingVertical: 15, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});
