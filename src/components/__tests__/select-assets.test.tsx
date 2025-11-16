import { render, screen, fireEvent } from '@testing-library/react';
import SelectAssets from '../select-assets';

// Mock the child components
jest.mock('../assets-card', () => ({
  __esModule: true,
  default: ({ asset }: { asset: any }) => (
    <div data-testid="assets-card">{asset.asset}</div>
  ),
}));

jest.mock('../select-assets-modal', () => ({
  __esModule: true,
  default: () => <div data-testid="select-assets-modal">Modal</div>,
}));

describe('SelectAssets', () => {
  it('renders the heading', () => {
    render(<SelectAssets />);
    expect(screen.getByText('Select Assets to Liquidate')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<SelectAssets />);
    expect(screen.getByText(/Choose which assets you want to sell/)).toBeInTheDocument();
  });

  it('renders assets when available', () => {
    render(<SelectAssets />);
    const assetCards = screen.getAllByTestId('assets-card');
    expect(assetCards.length).toBeGreaterThan(0);
  });

  it('shows "Add More" button when assets exist', () => {
    render(<SelectAssets />);
    expect(screen.getByText('Add More')).toBeInTheDocument();
  });

  it('opens modal when "Add More" button is clicked', () => {
    render(<SelectAssets />);
    const addButton = screen.getByText('Add More');
    
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('select-assets-modal')).toBeInTheDocument();
  });

  it('renders all asset cards', () => {
    render(<SelectAssets />);
    const assetCards = screen.getAllByTestId('assets-card');
    expect(assetCards.length).toBe(3); // Based on the mock data in the component
  });
});

