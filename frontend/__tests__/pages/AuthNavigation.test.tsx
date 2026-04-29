/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

/* Mock next/navigation */
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

/* Mock next/link */
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

/* Mock lucide-react */
jest.mock('lucide-react', () => ({
  Users: (props: any) => <span data-testid="icon-users" {...props} />,
  LogOut: (props: any) => <span data-testid="icon-logout" {...props} />,
  Home: (props: any) => <span data-testid="icon-home" {...props} />,
  RefreshCcw: (props: any) => <span data-testid="icon-refresh" {...props} />,
  Menu: (props: any) => <span data-testid="icon-menu" {...props} />,
  UserCircle: (props: any) => <span data-testid="icon-usercircle" {...props} />,
  X: (props: any) => <span data-testid="icon-x" {...props} />,
  XCircle: (props: any) => <span data-testid="icon-xcircle" {...props} />,
  History: (props: any) => <span data-testid="icon-history" {...props} />,
  ChevronRight: (props: any) => <span data-testid="icon-chevron" {...props} />,
  User: (props: any) => <span data-testid="icon-user" {...props} />,
  Settings: (props: any) => <span data-testid="icon-settings" {...props} />,
}));

/* Mock api */
jest.mock('@/lib/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

/* Mock jwt-decode */
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

/* Mock Toast */
jest.mock('@/components/Toast', () => ({
  Toast: ({ message, type }: any) => <div data-testid="toast" data-type={type}>{message}</div>,
}));

import Home from '../../app/page';
import { api } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

describe('Home Page — Auth Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should show "Login / Register" link when user is NOT logged in', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: [] });

    render(<Home />);

    /* Loading spinner ก่อน */
    /* รอ state update */
    const loginLink = await screen.findByText('Login / Register');
    expect(loginLink).toBeInTheDocument();
  });

  it('should show "Logout" button when user IS logged in', async () => {
    /* จำลองว่ามี token อยู่ */
    localStorage.setItem('token', 'fake-jwt-token');
    (jwtDecode as jest.Mock).mockReturnValue({ role: 'USER', sub: 'user-1' });
    (api.get as jest.Mock).mockResolvedValue({ data: [] });

    render(<Home />);

    const logoutBtn = await screen.findByText('Logout');
    expect(logoutBtn).toBeInTheDocument();
  });
});
