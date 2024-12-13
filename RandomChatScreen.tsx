import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { joinQueue, leaveQueue, listenForQueueChanges } from './RandomChatService';
import { getAuth } from 'firebase/auth';

export default function RandomChatScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [matchFound, setMatchFound] = useState(false); // 매칭 상태

  useEffect(() => {
    let isMounted = true; // 컴포넌트 언마운트 여부 확인용
    let timeout: NodeJS.Timeout;

    const setupQueue = async () => {
      try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;

        if (!userId) {
          throw new Error('User is not logged in');
        }

        console.log(`Joining queue as user: ${userId}`);
        await joinQueue(); // 대기열에 사용자 추가

        // 매칭 타임아웃 설정 (10초)
        timeout = setTimeout(() => {
          if (isMounted && !matchFound) {
            Alert.alert('매칭 실패', '상대방을 찾을 수 없습니다. 잠시 후에 다시 시도해주세요.');
            navigation.goBack(); // 매칭 실패 시 이전 화면으로 돌아가기
          }
        }, 10000);

        // 대기열 변경 감지 및 매칭 처리
        listenForQueueChanges(userId, (matchedUserId) => {
          if (isMounted) {
            setMatchFound(true); // 매칭 상태 업데이트
            console.log(`Matched with user: ${matchedUserId}`);
            navigation.replace('ChatRoom', { matchedUserId }); // 채팅방으로 이동
          }
        });
      } catch (error) {
        console.error('Error setting up queue:', error);
        Alert.alert('Error', '일시적으로 오류가 발생했습니다. 잠시 후에 다시 시도해주세요.');
        navigation.goBack(); // 오류 발생 시 이전 화면으로 돌아가기
      } finally {
        if (isMounted) {
          setLoading(false); // 로딩 상태 종료
        }
      }
    };

    setupQueue();

    return () => {
      isMounted = false; // 컴포넌트 언마운트 상태 설정
      clearTimeout(timeout); // 타이머 해제
      leaveQueue(); // 대기열에서 사용자 제거
    };
  }, [navigation, matchFound]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>새로운 사람을 찾고 있습니다...</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>취소하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 20, // 글자 크기 확대
    fontWeight: 'bold', // 굵은 글씨체
    marginVertical: 20, // 위아래 간격 추가
    textAlign: 'center',
    color: '#333',
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
