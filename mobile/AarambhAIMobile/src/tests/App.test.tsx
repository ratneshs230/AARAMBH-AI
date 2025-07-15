import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// Mock the entire app to test basic rendering
jest.mock('../navigation/AppNavigator', () => {
  return function MockAppNavigator() {
    return null;
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});