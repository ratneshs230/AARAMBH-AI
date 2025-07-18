/**
 * AARAMBH AI - AIConnectionTest Component Tests
 * Test suite for the AI connection testing component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AIConnectionTest from '../../components/debug/AIConnectionTest';
import { aiService } from '../../services/ai';

// Mock the AI service
vi.mock('../../services/ai', () => ({
  aiService: {
    getHealth: vi.fn(),
    sendRequest: vi.fn(),
    askTutor: vi.fn(),
  },
}));

// Mock the config
vi.mock('../../utils/config', () => ({
  config: {
    aiApiUrl: 'http://localhost:5000/api/ai',
    enableAI: true,
  },
}));

describe('AIConnectionTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with initial state', () => {
    render(<AIConnectionTest />);
    
    expect(screen.getByText('AI Connection Test')).toBeInTheDocument();
    expect(screen.getByText('Test AI Connection')).toBeInTheDocument();
    expect(screen.getByText('Status: No tests run')).toBeInTheDocument();
  });

  it('displays configuration information', () => {
    render(<AIConnectionTest />);
    
    expect(screen.getByText('Configuration Details:')).toBeInTheDocument();
    expect(screen.getByText(/AI API URL: http:\/\/localhost:5000\/api\/ai/)).toBeInTheDocument();
    expect(screen.getByText(/AI Features Enabled: Yes/)).toBeInTheDocument();
  });

  it('runs all tests when button is clicked', async () => {
    // Mock successful responses
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: {
        status: 'healthy',
        services: {
          gemini: true,
          teacherAgent: true,
        },
      },
    });

    (aiService.sendRequest as any).mockResolvedValue({
      success: true,
      data: {
        id: 'test-id',
        content: 'Test response',
      },
    });

    (aiService.askTutor as any).mockResolvedValue({
      success: true,
      data: {
        id: 'tutor-id',
        content: 'Tutor response',
      },
    });

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    // Check that tests are running
    await waitFor(() => {
      expect(screen.getByText('Running Tests...')).toBeInTheDocument();
    });

    // Wait for tests to complete
    await waitFor(() => {
      expect(screen.getByText('Test AI Connection')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check that all tests completed
    expect(screen.getByText(/4 passed, 0 failed/)).toBeInTheDocument();
  });

  it('handles health check success', async () => {
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: {
        status: 'healthy',
        services: {
          gemini: true,
          teacherAgent: true,
        },
      },
    });

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('AI service is healthy')).toBeInTheDocument();
    });

    expect(screen.getByText('SUCCESS')).toBeInTheDocument();
  });

  it('handles health check failure', async () => {
    (aiService.getHealth as any).mockRejectedValue(new Error('Service unavailable'));

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText(/Health check failed/)).toBeInTheDocument();
    });

    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });

  it('handles basic AI request success', async () => {
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: { status: 'healthy' },
    });

    (aiService.sendRequest as any).mockResolvedValue({
      success: true,
      data: {
        id: 'test-id',
        content: 'Connection successful',
      },
    });

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('Basic AI request successful')).toBeInTheDocument();
    });

    expect(aiService.sendRequest).toHaveBeenCalledWith({
      prompt: 'Test connection - please respond with "Connection successful"',
      agentType: 'teacher',
      metadata: { test: true },
    });
  });

  it('handles basic AI request failure', async () => {
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: { status: 'healthy' },
    });

    (aiService.sendRequest as any).mockRejectedValue(new Error('Request failed'));

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText(/Basic request failed/)).toBeInTheDocument();
    });
  });

  it('handles tutor agent test success', async () => {
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: { status: 'healthy' },
    });

    (aiService.sendRequest as any).mockResolvedValue({
      success: true,
      data: { content: 'Basic response' },
    });

    (aiService.askTutor as any).mockResolvedValue({
      success: true,
      data: {
        id: 'tutor-id',
        content: 'Tutor response about 2+2',
      },
    });

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('Tutor agent working correctly')).toBeInTheDocument();
    });

    expect(aiService.askTutor).toHaveBeenCalledWith('What is 2+2?', {
      subject: 'mathematics',
      level: 'basic',
    });
  });

  it('handles tutor agent test failure', async () => {
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: { status: 'healthy' },
    });

    (aiService.sendRequest as any).mockResolvedValue({
      success: true,
      data: { content: 'Basic response' },
    });

    (aiService.askTutor as any).mockRejectedValue(new Error('Tutor unavailable'));

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText(/Tutor test failed/)).toBeInTheDocument();
    });
  });

  it('displays test results with status indicators', async () => {
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: { status: 'healthy' },
    });

    (aiService.sendRequest as any).mockResolvedValue({
      success: true,
      data: { content: 'Success' },
    });

    (aiService.askTutor as any).mockResolvedValue({
      success: true,
      data: { content: 'Tutor success' },
    });

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('Configuration Check')).toBeInTheDocument();
      expect(screen.getByText('Health Check')).toBeInTheDocument();
      expect(screen.getByText('Basic AI Request')).toBeInTheDocument();
      expect(screen.getByText('Tutor Agent')).toBeInTheDocument();
    });
  });

  it('disables test button while tests are running', async () => {
    (aiService.getHealth as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: { status: 'healthy' } }), 100))
    );

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    // Button should be disabled and show different text
    expect(screen.getByText('Running Tests...')).toBeInTheDocument();
    expect(screen.getByText('Running Tests...')).toBeDisabled();
  });

  it('shows duration for completed tests', async () => {
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: { status: 'healthy' },
    });

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText(/Duration: \d+ms/)).toBeInTheDocument();
    });
  });

  it('truncates long response data', async () => {
    const longResponse = 'a'.repeat(300);
    
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: {
        status: 'healthy',
        longData: longResponse,
      },
    });

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText(/Response:/)).toBeInTheDocument();
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });
  });

  it('handles mixed success and failure results', async () => {
    (aiService.getHealth as any).mockResolvedValue({
      success: true,
      data: { status: 'healthy' },
    });

    (aiService.sendRequest as any).mockRejectedValue(new Error('Request failed'));

    (aiService.askTutor as any).mockResolvedValue({
      success: true,
      data: { content: 'Tutor success' },
    });

    render(<AIConnectionTest />);
    
    const testButton = screen.getByText('Test AI Connection');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText(/2 passed, 1 failed/)).toBeInTheDocument();
    });
  });
});