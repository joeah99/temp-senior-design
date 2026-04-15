import { render, screen } from '@testing-library/react';
import AssetsCard from '../assets-card';

const mockAsset = {
  id: 1,
  category: 'Tractor',
  asset: 'John Deer Tractor',
  year: '2018',
  fair_market_value: 150000,
  book_value: 120000,
  purchase_price: 100000,
};

// Mock the context with all required fields
jest.mock('@/context/ScenarioContext', () => ({
  useScenario: () => ({
    saleDetails: {},
    updateSaleDetails: jest.fn(),
  }),
}));

describe('AssetsCard', () => {
  it('renders asset information correctly', () => {
    render(<AssetsCard asset={mockAsset} onRemove={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.getByText('Tractor')).toBeInTheDocument();
    expect(screen.getByText('John Deer Tractor')).toBeInTheDocument();
    expect(screen.getByText('2018')).toBeInTheDocument();
  });

  it('displays fair market value', () => {
    render(<AssetsCard asset={mockAsset} onRemove={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.getByText('$150,000')).toBeInTheDocument();
    expect(screen.getByText('Fair Market Value')).toBeInTheDocument();
  });

  it('displays book value', () => {
    render(<AssetsCard asset={mockAsset} onRemove={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.getByText('$120,000')).toBeInTheDocument();
    expect(screen.getByText('Book Value')).toBeInTheDocument();
  });

  it('renders remove and edit buttons', () => {
    render(<AssetsCard asset={mockAsset} onRemove={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.getByRole('button', { name: /remove asset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit asset/i })).toBeInTheDocument();
  });

  it('renders as a list item', () => {
    render(<AssetsCard asset={mockAsset} onRemove={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});
