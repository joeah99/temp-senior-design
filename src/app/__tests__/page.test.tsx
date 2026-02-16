import { render, screen, waitFor } from '@testing-library/react';
import Home from '../page';

// Mock fetch globally
global.fetch = jest.fn();

// Set environment variable for tests
const originalEnv = process.env.NEXT_PUBLIC_API_URL;
beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

afterAll(() => {
  process.env.NEXT_PUBLIC_API_URL = originalEnv;
});

describe('Home Page', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the heading', () => {
    // Mock fetch before rendering
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    
    render(<Home />);
    expect(screen.getByText('Testing backend connection...')).toBeInTheDocument();
  });

  it('fetches data from API on mount', async () => {
    const mockData = { message: 'Backend connected' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('calls correct API endpoint', async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${apiUrl}/Valuation/total-fmv`);
    });
  });
});

