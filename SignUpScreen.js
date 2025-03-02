import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import styles from './styles';
import { ThemeContext } from "./ThemeContext";
// 경로 수정: SignUpScreen.js가 루트에 있을 경우
import { ensureUserDocument } from './src/utils/firebaseUtils';

const SignUpScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const completeSignUp = async () => {
    try {
      // 1. Firebase Auth에 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Firestore에 사용자 문서 생성 (ensureUserDocument 호출)
      await ensureUserDocument(user);
      
      // 3. 이메일 인증 전송
      await sendEmailVerification(user);
      Alert.alert('인증 이메일이 전송되었습니다. 이메일을 확인하세요.');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('이미 가입된 이메일입니다. 로그인 화면에서 로그인해주세요.');
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert(error.message);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.headerColor }]}>회원가입</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackgroundColor || "#fff", color: theme.textColor }]}
        placeholder="이메일"
        placeholderTextColor={theme.placeholderColor || "#888"}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackgroundColor || "#fff", color: theme.textColor }]}
        placeholder="비밀번호"
        placeholderTextColor={theme.placeholderColor || "#888"}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="회원가입" onPress={completeSignUp} />
      <Button title="로그인으로 이동" onPress={() => navigation.navigate('LoginScreen')} />
    </View>
  );
};

export default SignUpScreen;
