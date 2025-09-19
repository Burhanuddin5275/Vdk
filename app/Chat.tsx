import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image, KeyboardAvoidingView, Platform, StatusBar, FlatListProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { db } from './firebase'; // 🔁 Adjust this path based on your project
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  sent: boolean;
  phone: string;
  reply?: boolean;
  time: string;
  createdAt?: Timestamp;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const sendMessage = async () => {
    if (message.trim() === '') return;

    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage = {
      text: message,
      sent: true,
      phone: '+923001234567',
      reply: false,
      time: timeString,
      timestamp: currentTime.getTime(),
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'dkt'), newMessage);
      setMessage('');

      // Auto-reply from agent
      setTimeout(async () => {
        const replyTime = new Date();
        await addDoc(collection(db, 'dkt'), {
          text: '',
          sent: false,
          phone: '+92638273832',
          reply: true,
          time: replyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: replyTime.getTime(),
          createdAt: serverTimestamp()
        });
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'dkt'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs
        .filter(doc => doc.data().text && doc.data().text.trim() !== '') // Filter out empty messages
        .map(doc => {
          const data = doc.data();
          const messageTime = data.timestamp 
            ? new Date(data.timestamp)
            : data.createdAt?.toDate?.() || new Date();
            
          return {
            id: doc.id,
            text: data.text,
            sent: data.sent || false,
            phone: data.phone || '',
            reply: data.reply || false,
            time: messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: messageTime.getTime(),
            ...data
          } as Message;
        });
      
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sent ? styles.sentMessage : styles.receivedMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sent ? styles.sentBubble : styles.receivedBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sent ? styles.sentText : styles.receivedText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timeText,
          item.sent ? styles.sentTime : styles.receivedTime
        ]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>Support Team</Text>
              <Text style={styles.status}>Online</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="call" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        {/* Message Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachmentButton}>
              <Ionicons name="attach" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !message && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!message}
            >
              <Ionicons
                name="send"
                size={20}
                color={message ? colors.white : '#ccc'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  userName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '100%',
  },
  sentBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: colors.white,
  },
  receivedText: {
    color: '#333',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTime: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 12,
    minHeight: 48,
    marginBottom: 8,
  },
  attachmentButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
});

export default Chat;
