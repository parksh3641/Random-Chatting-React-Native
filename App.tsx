import React, { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './SplashScreen';
import PhoneAuthScreen from './PhoneAuthScreen';
import SignUpScreen from './SignUpScreen';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import RandomChatScreen from './RandomChatScreen';
import ChatRoomScreen from './ChatRoomScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const backAction = () => {
      // 뒤로가기 버튼 비활성화
      //Alert.alert('안내', '뒤로가기는 사용할 수 없습니다.');
      return true; // 기본 동작을 막음
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // 컴포넌트 언마운트 시 리스너 제거
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="RandomChat" component={RandomChatScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
