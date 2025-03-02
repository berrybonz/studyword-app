import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import MyCheckBox from './MyCheckBox';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import styles from './styles';
import { ThemeContext } from "./ThemeContext";

const LoginScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.headerColor }]}>로그인</Text>
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
      <View style={styles.checkboxContainer}>
        <MyCheckBox
          value={rememberMe}
          onValueChange={(newValue) => setRememberMe(newValue)}
        />
        <Text style={[styles.label, { color: theme.textColor }]}>자동 로그인</Text>
      </View>
      <Button title="로그인" onPress={handleLogin} />
      <Button title="회원가입으로 이동" onPress={() => navigation.navigate('SignUpScreen')} />
    </View>
  );
};

export default LoginScreen;
