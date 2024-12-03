import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { database, auth } from './firebase';
import { ref, push, onValue, set, remove } from 'firebase/database';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Main: undefined;
  ChatRoom: { roomId: string };
};

type ChatRoomNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

const ChatRoomScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const { roomId } = route.params as { roomId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const hasLeftRoom = useRef(false); // 방 나가기 중복 호출 방지

  const currentUserId = auth.currentUser?.uid || 'unknown-user-id';

  useEffect(() => {
    if (!currentUserId) {
      Alert.alert('Error', 'User is not logged in.');
      navigation.navigate('Main');
      return;
    }

    const messagesRef = ref(database, `chatRooms/${roomId}/messages`);
    const typingRef = ref(database, `chatRooms/${roomId}/typing`);
    const statusRef = ref(database, `chatRooms/${roomId}/status`);

    // 메시지 실시간 수신
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const fetchedMessages = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];
      setMessages(fetchedMessages);

      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    // 상대방 입력 상태 실시간 수신
    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      const typingUserId = snapshot.val();
      if (typingUserId && typingUserId !== currentUserId) {
        setTypingStatus('상대방이 입력 중입니다...');
      } else {
        setTypingStatus(null);
      }
    });

    // 상대방 방 나가기 상태 감지
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (status === 'closed' && !hasLeftRoom.current) {
        Alert.alert('알림', '상대방이 대화를 종료했습니다.', [
          {
            text: '확인',
            onPress: () => navigation.navigate('Main'),
          },
        ]);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      unsubscribeStatus();
    };
  }, [roomId]);

  const handleSendMessage = async () => {
    if (messageText.trim() === '') return;

    try {
      const messagesRef = ref(database, `chatRooms/${roomId}/messages`);
      const typingRef = ref(database, `chatRooms/${roomId}/typing`);

      const newMessage = {
        senderId: currentUserId,
        text: messageText,
        createdAt: Date.now(),
      };

      await push(messagesRef, newMessage);
      setMessageText('');
      set(typingRef, null); // 입력 상태 초기화
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    const typingRef = ref(database, `chatRooms/${roomId}/typing`);

    if (text.trim() === '') {
      set(typingRef, null); // 입력 상태 초기화
    } else {
      set(typingRef, currentUserId); // 현재 사용자 입력 중 상태 설정
    }
  };

  const handleLeaveRoom = async () => {
    if (hasLeftRoom.current) return; // 중복 호출 방지
    hasLeftRoom.current = true;

    Alert.alert('방 나가기', '방에서 나가시겠습니까?', [
      { text: '취소', style: 'cancel', onPress: () => (hasLeftRoom.current = false) },
      {
        text: '확인',
        onPress: async () => {
          try {
            const roomRef = ref(database, `chatRooms/${roomId}`);
            const statusRef = ref(database, `chatRooms/${roomId}/status`);

            // 상대방에게 방 종료 신호 보내기
            await set(statusRef, 'closed');

            // 방 삭제
            await remove(roomRef);

            navigation.navigate('Main');
          } catch (error) {
            Alert.alert('Error', 'Failed to leave the room. Please try again.');
            hasLeftRoom.current = false; // 실패 시 플래그 초기화
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleLeaveRoom}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Room</Text>
      </View>

      {/* 메시지 리스트 */}
      <FlatList
        ref={flatListRef}
        contentContainerStyle={styles.messageListContainer}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.senderId === currentUserId ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 상대방 입력 상태 표시 */}
      {typingStatus && <Text style={styles.typingStatus}>{typingStatus}</Text>}

      {/* 입력 필드 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="메세지를 입력하세요..."
          value={messageText}
          onChangeText={handleTyping}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />
        <Button title="보내기" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 60,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  messageListContainer: {
    padding: 10,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 10,
    borderRadius: 15,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  typingStatus: {
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
});

export default ChatRoomScreen;
