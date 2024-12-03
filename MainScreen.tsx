// MainScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function MainScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      {/* 안내 문구 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>새로운 친구를 만날 준비 되셨나요?</Text>
        <Text style={styles.subText}>마음이 통하는 전 세계의 친구들과 대화하고, 게임을 통해 더 가까워질 수 있습니다. 지금 바로 시작해보세요!</Text>
      </View>

      {/* 매칭 시작 버튼 */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RandomChat')}
      >
        <Text style={styles.buttonText}>지금 바로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20, // 위아래 간격
    paddingHorizontal: 30, // 좌우 간격
  },
  infoBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    color: '#333',
  },
  subText: {
    fontSize: 18,
    textAlign: 'left',
    color: '#666',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Android용 그림자
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
