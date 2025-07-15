import 'react-native-gesture-handler/jestSetup';

// Mock expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  AntDesign: () => null,
  FontAwesome: () => null,
}));

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  Button: 'Button',
  Card: 'Card',
  Text: 'Text',
  Title: 'Title',
  Paragraph: 'Paragraph',
  Avatar: 'Avatar',
  List: {
    Item: 'ListItem',
    Icon: 'ListIcon',
  },
  IconButton: 'IconButton',
  FAB: 'FAB',
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence warnings
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};