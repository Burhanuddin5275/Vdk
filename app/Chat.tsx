import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { colors } from '@/theme/colors';
import { useAppSelector } from '@/store/hooks';

import {
  selectIsAuthenticated,
  selectToken,
} from '@/store/authSlice';

import {
  getChatMessage,
  sendChatMessage,
} from '@/services/chat';

import { Api_url } from '@/url/url';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale } from 'react-native-size-matters';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectToken);

  // =========================
  // LOAD MESSAGES
  // =========================
  const loadMessages = async () => {
    if (!token) return;

    try {
      const data = await getChatMessage(token);

      console.log('API RAW:', data);

      setChats(
        Array.isArray(data?.messages)
          ? data.messages
          : []
      );
    } catch (e) {
      console.log(e);
      setChats([]);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [token]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({
        animated: true,
      });
    }, 200);
  }, [chats]);

  // =========================
  // PICK IMAGE
  // =========================
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Gallery permission is needed'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          allowsEditing: true,
        });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login first'
      );

      router.push('./Login');
      return;
    }

    if (!message.trim() && !selectedImage)
      return;

    if (!token) return;

    // optimistic message
    const tempMsg = {
      id: Date.now().toString(),
      message: message.trim(),
      sender: 'user',
      timestamp: Date.now(),
      url: selectedImage,
    };

    try {
      // show immediately in UI
      setChats(prev => {
        const safe = Array.isArray(prev)
          ? prev
          : [];

        return [...safe, tempMsg];
      });

      // =========================
      // IMAGE MESSAGE
      // =========================
      if (selectedImage) {
        const formData = new FormData();

        formData.append(
          'file_type',
          'image'
        );

        const fileName =
          selectedImage.split('/').pop() ||
          `image_${Date.now()}.jpg`;

        formData.append('file', {
          uri:
            Platform.OS === 'ios'
              ? selectedImage.replace(
                'file://',
                ''
              )
              : selectedImage,
          name: fileName,
          type: 'image/jpeg',
        } as any);

        if (message.trim()) {
          formData.append(
            'message',
            message.trim()
          );
        }

        const response = await fetch(
          `${Api_url}/chat/api/send/`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        console.log(
          'SEND RESPONSE:',
          JSON.stringify(data, null, 2)
        );
      }

      // =========================
      // TEXT MESSAGE
      // =========================
      else {
        const response =
          await sendChatMessage(
            message.trim(),
            token
          );

        console.log(
          'TEXT RESPONSE:',
          response
        );
      }

      // clear input
      setMessage('');
      setSelectedImage(null);

      // refresh chats from backend
      await loadMessages();

    } catch (e) {
      console.log('SEND ERROR:', e);

      // remove failed optimistic message
      setChats(prev =>
        prev.filter(
          msg => msg.id !== tempMsg.id
        )
      );

      Alert.alert(
        'Error',
        'Message not sent'
      );
    }
  };

  // =========================
  // RENDER MESSAGE
  // =========================
  const renderItem = ({ item }: any) => {
    const isUser =
      item.sender?.toLowerCase() === 'user';

    const time = item.timestamp
      ? new Date(
        item.timestamp
      ).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      : '';

    const imageUrl =
      item.url ||
      item.image ||
      item.file;

    return (
      <View
        style={[
          styles.msgContainer,
          isUser
            ? styles.right
            : styles.left,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser
              ? styles.myBubble
              : styles.otherBubble,
          ]}
        >
          {/* TEXT */}
          {!!item.message && (
            <Text
              style={[
                styles.msgText,
                isUser
                  ? styles.myText
                  : styles.otherText,
              ]}
            >
              {item.message}
            </Text>
          )}

          {/* IMAGE */}
          {!!imageUrl && (
            <Image
              source={{
                uri:
                  imageUrl.startsWith(
                    'http'
                  )
                    ? imageUrl
                    : `${Api_url}${imageUrl}`,
              }}
              style={styles.chatImage}
              resizeMode="cover"
            />
          )}

          {/* TIME */}
          <Text
            style={[
              styles.timeText,
              isUser
                ? styles.myTime
                : styles.otherTime,
            ]}
          >
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(
            insets.bottom,
            verticalScale(4)
          ),
        },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileIcon}>
            <Ionicons
              name="person"
              size={22}
              color="#fff"
            />
          </View>

          <View>
            <Text style={styles.headerText}>
              Support Chat
            </Text>

            <Text style={styles.onlineText}>
              Online
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* CHAT LIST */}
        <FlatList
          ref={flatListRef}
          data={
            Array.isArray(chats)
              ? chats
              : []
          }
          keyExtractor={(item, index) =>
            item.id?.toString() ||
            index.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={
            styles.chatList
          }
        />

        {/* IMAGE PREVIEW */}
        {selectedImage && (
          <View
            style={styles.previewContainer}
          >
            <Image
              source={{
                uri: selectedImage,
              }}
              style={styles.previewImage}
            />

            <TouchableOpacity
              style={styles.removeImage}
              onPress={() =>
                setSelectedImage(null)
              }
            >
              <Ionicons
                name="close"
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* INPUT */}
        <View style={styles.inputBox}>
          {/* ATTACH */}
          <TouchableOpacity
            onPress={pickImage}
            style={styles.attachBtn}
          >
            <Ionicons
              name="attach"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          {/* INPUT */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            style={styles.input}
            multiline
          />

          {/* SEND */}
          <TouchableOpacity
            onPress={sendMessage}
            style={styles.sendBtn}
          >
            <Ionicons
              name="send"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingBottom: 12,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor:
      'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  onlineText: {
    color: '#d9fdd3',
    fontSize: 12,
    marginTop: 2,
  },

  chatList: {
    padding: 10,
  },

  msgContainer: {
    marginVertical: 5,
    flexDirection: 'row',
  },

  left: {
    justifyContent: 'flex-start',
  },

  right: {
    justifyContent: 'flex-end',
  },

  bubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },

  myBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 0,
  },

  otherBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
  },

  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },

  myText: {
    color: '#000',
  },

  otherText: {
    color: '#000',
  },

  chatImage: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginTop: 5,
  },

  timeText: {
    fontSize: 10,
    marginTop: 5,
  },

  myTime: {
    color: '#555',
    textAlign: 'right',
  },

  otherTime: {
    color: '#777',
    textAlign: 'left',
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
  },

  attachBtn: {
    paddingHorizontal: 8,
  },

  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },

  sendBtn: {
    marginLeft: 8,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
  },

  previewContainer: {
    backgroundColor: '#fff',
    padding: 10,
    position: 'relative',
  },

  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },

  removeImage: {
    position: 'absolute',
    top: 15,
    left: 85,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
});