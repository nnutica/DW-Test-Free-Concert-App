/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConcertCard } from '../../components/ConcertCard';

/* Mock lucide-react */
jest.mock('lucide-react', () => ({
  Users: (props: any) => <span data-testid="icon-users" {...props} />,
}));

describe('ConcertCard Component', () => {
  const defaultProps = {
    name: 'Summer Rock Festival',
    description: 'A great outdoor concert.',
    totalSeats: 500,
    availableSeats: 200,
    isFullyBooked: false,
    hasReserved: false,
    onBook: jest.fn(),
    onCancel: jest.fn(),
  };

  it('should show "Available" badge and "Reserve" button when seats are available', () => {
    render(<ConcertCard {...defaultProps} />);

    expect(screen.getByText('Summer Rock Festival')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Reserve')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('should show "Sold Out" badge and disabled button when fully booked', () => {
    render(
      <ConcertCard
        {...defaultProps}
        availableSeats={0}
        isFullyBooked={true}
      />
    );

    expect(screen.getByText('Sold Out', { selector: 'span' })).toBeInTheDocument();
    const btn = screen.getByText('Sold Out', { selector: 'button' });
    expect(btn).toBeDisabled();
  });

  it('should show "Cancel" button when user has already reserved', () => {
    render(
      <ConcertCard
        {...defaultProps}
        hasReserved={true}
      />
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.queryByText('Reserve')).not.toBeInTheDocument();
  });

  it('should call onBook when Reserve button is clicked', () => {
    const onBook = jest.fn();
    render(<ConcertCard {...defaultProps} onBook={onBook} />);

    fireEvent.click(screen.getByText('Reserve'));
    expect(onBook).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<ConcertCard {...defaultProps} hasReserved={true} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
