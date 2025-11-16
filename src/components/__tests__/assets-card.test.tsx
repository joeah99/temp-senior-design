import { render, screen } from '@testing-library/react';
import AssetsCard from '../assets-card';

const mockAsset = {
  id: '1',
  category: 'Tractor',
  asset: 'John Deer Tractor',
  year: '2018',
  fair_market_value: '150000',
  book_value: '120000',
};

describe('AssetsCard', () => {
  it('renders asset information correctly', () => {
    render(<AssetsCard asset={mockAsset} />);
    
    expect(screen.getByText('Tractor')).toBeInTheDocument();
    expect(screen.getByText('John Deer Tractor')).toBeInTheDocument();
    expect(screen.getByText('2018')).toBeInTheDocument();
  });

  it('displays fair market value', () => {
    render(<AssetsCard asset={mockAsset} />);
    
    expect(screen.getByText('$150000')).toBeInTheDocument();
    expect(screen.getByText('Fair Market Value')).toBeInTheDocument();
  });

  it('displays book value', () => {
    render(<AssetsCard asset={mockAsset} />);
    
    expect(screen.getByText('$120000')).toBeInTheDocument();
    expect(screen.getByText('Book Value')).toBeInTheDocument();
  });

  it('renders delete button', () => {
    render(<AssetsCard asset={mockAsset} />);
    
    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<AssetsCard asset={mockAsset} />);
    
    const card = screen.getByRole('listitem');
    expect(card).toHaveClass('flex', 'flex-col', 'border');
  });
});

