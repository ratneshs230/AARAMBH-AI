import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  maxLength?: number;
  style?: ViewStyle;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Type your message...',
  multiline = true,
  disabled = false,
  maxLength = 1000,
  style,
}) => {
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(40);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
      setInputHeight(40);
    }
  };

  const handleContentSizeChange = (event: any) => {
    if (multiline) {
      const newHeight = Math.min(
        Math.max(40, event.nativeEvent.contentSize.height),
        120
      );
      setInputHeight(newHeight);
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            {
              height: inputHeight,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={COLORS.grey[400]}
          multiline={multiline}
          maxLength={maxLength}
          editable={!disabled}
          onContentSizeChange={handleContentSizeChange}
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend ? COLORS.primary[600] : COLORS.grey[300],
            },
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          <Ionicons
            name="send"
            size={20}
            color={canSend ? COLORS.background.light : COLORS.grey[500]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.grey[50],
    borderRadius: DIMENSIONS.BORDER_RADIUS_LARGE,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    paddingVertical: 8,
    paddingRight: 12,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ChatInput;