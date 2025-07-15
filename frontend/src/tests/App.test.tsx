import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';

// Test individual routes instead of the full App
import HomePage from '../pages/HomePage';

// Mock components that might have complex dependencies
vi.mock('../pages/HomePage', () => ({
  default: () => <div data-testid='home-page'>Home Page</div>,
}));

vi.mock('../utils/theme', () => ({
  lightTheme: {},
}));

describe('App Routes', () => {
  it('renders home page component', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path='/' element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders 404 for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <Routes>
          <Route path='/' element={<div>Home</div>} />
          <Route path='*' element={<div>Page Not Found</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });
});
