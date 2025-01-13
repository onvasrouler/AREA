import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { getApiClient } from '@/common/client/APIClient';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
jest.mock('@/common/client/APIClient');
jest.mock('@/hooks/use-toast');
jest.mock('@/components/ui/CustomGoogleLogin', () => ({
  CustomGoogleLogin: () => <button>Google Login</button>,
}));

// Mock the PasswordResetComponent
jest.mock('./PasswordResetComponent', () => ({
  PasswordResetComponent: () => <div>Password Reset Component</div>,
}));

describe('LoginPage', () => {
  const mockApiClient = {
    post: jest.fn(),
  };

  const mockToast = jest.fn();

  beforeEach(() => {
    getApiClient.mockReturnValue(mockApiClient);
    useToast.mockReturnValue({ toast: mockToast });
    window.localStorage.clear();
  });

  test('renders login form by default', () => {
    render(<LoginPage />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('switches to signup form when "Sign Up" is clicked', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Don't have an account? Sign Up"));
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput.type).toBe('password');
    fireEvent.click(screen.getByLabelText('Show password'));
    expect(passwordInput.type).toBe('text');
  });

  test('submits login form with valid credentials', async () => {
    mockApiClient.post.mockResolvedValueOnce({
      json: () => Promise.resolve({ session: 'fake-session-token' }),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('login', {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Welcome back!',
        description: "You've been successfully logged in.",
        variant: 'default',
      });
      expect(localStorage.getItem('session')).toBe('fake-session-token');
    });
  });

  test('displays error toast on login failure', async () => {
    mockApiClient.post.mockRejectedValueOnce({
      message: 'Invalid credentials',
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Login Error',
        description: 'Invalid credentials',
      });
    });
  });

  test('submits signup form with valid data', async () => {
    mockApiClient.post.mockResolvedValueOnce({
      status: 200,
    });

    render(<LoginPage />);
    fireEvent.click(screen.getByText("Don't have an account? Sign Up"));
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('register', {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Registration Successful',
        description: 'Please check your email for the verification code.',
        variant: 'default',
      });
      expect(screen.getByText('Confirm your registration')).toBeInTheDocument();
    });
  });

  // Add more tests for other scenarios like registration confirmation, Google login, etc.
});

