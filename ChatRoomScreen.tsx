import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { database, auth } from './firebase'; // firebase.ts에서 초기화된 Firebase 가져오기
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { useRoute } from '@react-navigation/native';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

const ChatRoomScreen: React.FC = () => {
  const route = useRoute();
  const { roomId } = route.params as { roomId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');

  const currentUserId = auth.currentUser?.uid || 'unknown-user-id';

  useEffect(() => {
    if (!currentUserId) {
      Alert.alert('Error', 'User is not logged in.');
      return;
    }

    const messagesRef = ref(database, `chatRooms/${roomId}/messages`);

    // 메시지 실시간 수신
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const fetchedMessages = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];
      setMessages(fetchedMessages);
    });

    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 제거
  }, [roomId]);

  const handleSendMessage = async () => {
    if (messageText.trim() === '') return;

    try {
      const messagesRef = ref(database, `chatRooms/${roomId}/messages`);

      const newMessage = {
        senderId: currentUserId,
        text: messageText,
        createdAt: Date.now(), // 현재 시간 밀리초
      };

      await push(messagesRef, newMessage);
      setMessageText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
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
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={messageText}
          onChangeText={setMessageText}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1f7c4',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default ChatRoomScreen;
