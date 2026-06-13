import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { ErrorScreen } from '../components/ui/ErrorScreen';

describe('LoadingScreen', () => {
  it('renders loading text', () => {
    render(<LoadingScreen />);
    expect(screen.getByText(/loading menu/i)).toBeInTheDocument();
  });
});

describe('ErrorScreen', () => {
  it('renders connection failed heading', () => {
    render(<ErrorScreen />);
    expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
  });

  it('renders the default message when no message prop is given', () => {
    render(<ErrorScreen />);
    expect(screen.getByText(/spring boot backend/i)).toBeInTheDocument();
  });

  it('renders a custom message when provided', () => {
    render(<ErrorScreen message="Custom error message" />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders a retry button', () => {
    render(<ErrorScreen onRetry={vi.fn()} />);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorScreen onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
