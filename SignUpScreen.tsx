import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Firebase 초기화 파일

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      // 회원가입 진행
      await createUserWithEmailAndPassword(auth, email, password);

      // 회원가입 성공 후 자동 로그인
      await signInWithEmailAndPassword(auth, email, password);

      navigation.navigate('Main'); // MainScreen으로 이동
    } catch (error: any) {
      console.error('Sign-up error:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Main'); // MainScreen으로 이동
    } catch (error: any) {
      console.error('Login error:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat & Play 에 오신 것을 환영합니다 !</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      {/* 버튼 컨테이너로 버튼을 감싸서 간격 추가 */}
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="회원 가입" onPress={handleSignUp} disabled={loading} />
        </View>
        <View style={styles.button}>
          <Button title="로그인" onPress={handleLogin} disabled={loading} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20, // 버튼 그룹과 입력 필드 사이 간격
  },
  button: {
    marginBottom: 15, // 버튼 간 간격
  },
});
