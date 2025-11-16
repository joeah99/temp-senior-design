import { render, screen } from '@testing-library/react';
import NavBar from '../nav-bar';

// Mock Next.js Image and Link components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
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
  it('renders the navigation bar', () => {
    render(<NavBar />);
    const nav = screen.getByRole('banner');
    expect(nav).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    render(<NavBar />);
    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/img/dpa-logo.jpg');
  });

  it('has a link to home page', () => {
    render(<NavBar />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('applies correct CSS classes', () => {
    render(<NavBar />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('flex', 'items-center', 'py-4', 'px-8');
  });
});

