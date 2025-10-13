import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  subtitle?: string;
  onClose: () => void;
  buttonText?: string;
  autoCloseDelay?: number; // in milliseconds
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  subtitle,
  onClose,
  buttonText = 'OK',
  autoCloseDelay = 2000, // default 2 seconds
}) => {
  // Auto-close after delay
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [visible, autoCloseDelay, onClose]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={60} color={colors.primaryDark} />
          </View>
          <Text style={styles.title}>Success!</Text>
          <Text style={styles.message}>{message}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SuccessModal;
