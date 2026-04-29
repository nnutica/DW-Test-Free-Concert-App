/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Toast } from '../../components/Toast';

/* Mock lucide-react icons */
jest.mock('lucide-react', () => ({
  X: (props: any) => <span data-testid="icon-x" {...props} />,
  XCircle: (props: any) => <span data-testid="icon-xcircle" {...props} />,
}));

describe('Toast Component', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should render success message with green background', () => {
    const onClose = jest.fn();
    render(<Toast message="Booking confirmed!" type="success" onClose={onClose} />);

    expect(screen.getByText('Booking confirmed!')).toBeInTheDocument();
    /* success toast uses green bg */
    const container = screen.getByText('Booking confirmed!').closest('div');
    expect(container?.className).toContain('bg-[#D2E7D6]');
  });

  it('should render error message with red background', () => {
    const onClose = jest.fn();
    render(<Toast message="Concert is fully booked" type="error" onClose={onClose} />);

    expect(screen.getByText('Concert is fully booked')).toBeInTheDocument();
    const container = screen.getByText('Concert is fully booked').closest('div');
    expect(container?.className).toContain('bg-[#FCE4E4]');
  });

  it('should auto-close after 4 seconds', () => {
    const onClose = jest.fn();
    render(<Toast message="Test" type="success" onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();
    jest.advanceTimersByTime(4000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Toast message="Test" type="error" onClose={onClose} />);

    const closeBtn = screen.getByRole('button');
    closeBtn.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
