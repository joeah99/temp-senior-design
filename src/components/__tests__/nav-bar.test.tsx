import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '../nav-bar';

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/context/AuthContext';

// Mock Next.js Image and Link
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

describe('NavBar', () => {
  it('renders the navigation bar header', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, logout: jest.fn() });
    render(<NavBar />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, logout: jest.fn() });
    render(<NavBar />);
    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/img/dpa-logo.jpg');
  });

  it('has a link to the home page', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, logout: jest.fn() });
    render(<NavBar />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('does not render user info when not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, logout: jest.fn() });
    render(<NavBar />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows user name and sign out button when logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { full_name: 'Jane Doe', email: 'jane@test.com' },
      logout: jest.fn(),
    });
    render(<NavBar />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    
    // Open the dropdown first
    const userButton = screen.getByRole('button', { name: /jane doe/i });
    fireEvent.click(userButton);
    
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});
