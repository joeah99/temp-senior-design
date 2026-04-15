import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/context/AuthContext';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });
    render(<Home />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders AuthForm when not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    render(<Home />);
    // AuthForm is rendered — the heading is present
    expect(screen.getByRole('heading', { name: /Asset Manager/i })).toBeInTheDocument();
  });

  it('redirects to /scenarios when user is logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { full_name: 'Test User', email: 'test@test.com' },
      loading: false,
    });
    render(<Home />);
    expect(mockPush).toHaveBeenCalledWith('/scenarios');
  });
});
