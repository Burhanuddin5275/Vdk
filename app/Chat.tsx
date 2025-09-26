import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image, KeyboardAvoidingView, Platform, StatusBar, FlatListProps, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectPhone } from '@/store/authSlice';

interface Message {
  id: string;
  text: string;
  sent: boolean;
  phone: string;
  delete:boolean;
  reply?: boolean;
  time: string;
  createdAt?: Timestamp;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userPhone = useAppSelector(selectPhone);

  const sendMessage = async () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please log in to send messages');
      router.push('./Login');
      return;
    }

    if (message.trim() === '') return;

    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!userPhone) {
      console.error('User phone number not found');
      return;
    }

    const sent = {
      text: message,
      sent: true,
      phone: userPhone, 
      reply: false,
      time: timeString,
      timestamp: currentTime.getTime(),
      createdAt: serverTimestamp()
    };
    const reply = {
      text: '',
      sent: false,
      phone: userPhone, 
      delete: false,
      reply: true,
      time: timeString,
      timestamp: currentTime.getTime(),
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'dkt'), sent);
      setMessage('');

      await addDoc(collection(db, 'dkt'), reply);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !userPhone) {
      setMessages([]); // Clear messages if not authenticated
      return;
    }

    
    const messagesQuery = query(
      collection(db, 'dkt'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.text && 
                 data.text.trim() !== '' && 
                 (data.phone === userPhone || (data.reply && data.phone === userPhone)) &&
                 !data.delete; 
        })
        .map(doc => {
          const data = doc.data();
          const messageTime = data.timestamp 
            ? new Date(data.timestamp)
            : data.createdAt?.toDate?.() || new Date();
            
          return {
            id: doc.id,
            text: data.text,
            sent: data.phone === userPhone,
            phone: data.phone,
            reply: data.reply || false,
            delete: data.delete || false,
            time: messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: messageTime.getTime(),
            ...data
          } as Message;
        });
      
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [isAuthenticated, userPhone]); // Re-run when auth status or phone number changes

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleDeleteMessage = async (msg: Message, permanent: boolean = false) => {
    if (!msg.id) return;
    
    try {
      if (permanent) {
        // Permanent delete
        await deleteDoc(doc(db, 'dkt', msg.id));
      } else {
        // Soft delete - mark as deleted
        await updateDoc(doc(db, 'dkt', msg.id), {
          delete: true,
          deletedAt: serverTimestamp()
        });
      }
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete message. Please try again.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableWithoutFeedback 
      onLongPress={() => {
        // Allow deleting both sent messages and replies
        if (item.sent || item.reply) {
          setSelectedMessage(item);
          setShowDeleteModal(true);
        }
      }}
    >
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
    </TouchableWithoutFeedback>
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
              style={[
                styles.sendButton, 
                (!message || !isAuthenticated) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!message || !isAuthenticated}
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

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDeleteModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Delete Message</Text>
                <Text style={styles.modalText}>Are you sure you want to delete this message?</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowDeleteModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  {selectedMessage?.reply ? (
                        <TouchableOpacity 
                        style={[styles.modalButton, styles.softDeleteButton]}
                        onPress={() => selectedMessage && handleDeleteMessage(selectedMessage, false)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.softDeleteButton]}
                        onPress={() => selectedMessage && handleDeleteMessage(selectedMessage, false)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.deleteButton]}
                        onPress={() => selectedMessage && handleDeleteMessage(selectedMessage, true)}
                      >
                        <Text style={styles.deleteButtonText}>Delete Permanently</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
    marginBottom: 10,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  softDeleteButton: {
    backgroundColor: '#ff9800',
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  deleteButtonText: {
    fontWeight: '500',
    color: 'white',
  },
});

export default Chat;
