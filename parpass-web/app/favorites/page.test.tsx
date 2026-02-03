import { render, screen, waitFor } from '@testing-library/react';
import FavoritesPage from './page';
import * as api from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  getMemberByCode: jest.fn(),
  getMemberFavorites: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('FavoritesPage', () => {
  const mockMember = {
    id: 'm1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    parpass_code: 'ABC123',
    status: 'active',
    health_plan_name: 'Blue Cross',
    tier: 'premium' as const,
    monthly_rounds: 8,
  };

  const mockFavorites = [
    {
      id: '1',
      name: 'Pine Valley Golf Club',
      city: 'Pine Valley',
      state: 'NJ',
      zip: '08021',
      holes: 18,
      tier_required: 'premium' as const,
      phone: '856-783-3000',
      latitude: '39.7828',
      longitude: '-74.8939',
    },
    {
      id: '2',
      name: 'Pebble Beach',
      city: 'Pebble Beach',
      state: 'CA',
      zip: '93953',
      holes: 18,
      tier_required: 'core' as const,
      phone: '831-624-3811',
      latitude: '36.5674',
      longitude: '-121.9489',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('should display "Please sign in first" message when no user code is found', async () => {
    // localStorage is empty (no code stored)
    render(<FavoritesPage />);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Please sign in first')).toBeInTheDocument();
    });

    // Should show "Sign In" button
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/');

    // API should not be called
    expect(api.getMemberByCode).not.toHaveBeenCalled();
    expect(api.getMemberFavorites).not.toHaveBeenCalled();
  });

  it('should display "No favorites yet" message when user has no favorite courses', async () => {
    // Set up localStorage with a valid code
    window.localStorage.setItem('parpass_code', 'ABC123');

    (api.getMemberByCode as jest.Mock).mockResolvedValueOnce(mockMember);
    (api.getMemberFavorites as jest.Mock).mockResolvedValueOnce([]);

    render(<FavoritesPage />);

    // Should show loading initially
    expect(screen.getByText('Loading favorites...')).toBeInTheDocument();

    // Wait for no favorites message
    await waitFor(() => {
      expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    });

    // Should show "Browse Courses" button
    const browseCourses = screen.getByRole('link', { name: /browse courses/i });
    expect(browseCourses).toBeInTheDocument();
    expect(browseCourses).toHaveAttribute('href', '/courses');

    // Verify API calls
    expect(api.getMemberByCode).toHaveBeenCalledWith('ABC123');
    expect(api.getMemberFavorites).toHaveBeenCalledWith('m1');
  });

  it('should display favorite courses when user has favorites', async () => {
    window.localStorage.setItem('parpass_code', 'ABC123');

    (api.getMemberByCode as jest.Mock).mockResolvedValueOnce(mockMember);
    (api.getMemberFavorites as jest.Mock).mockResolvedValueOnce(mockFavorites);

    render(<FavoritesPage />);

    // Wait for favorites to load
    await waitFor(() => {
      expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    });

    // All favorites should be displayed
    expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    expect(screen.getByText('Pebble Beach')).toBeInTheDocument();

    // Check course details are rendered
    expect(screen.getByText('Pine Valley, NJ 08021')).toBeInTheDocument();
    expect(screen.getByText('Pebble Beach, CA 93953')).toBeInTheDocument();

    // Verify API calls
    expect(api.getMemberByCode).toHaveBeenCalledWith('ABC123');
    expect(api.getMemberFavorites).toHaveBeenCalledWith('m1');
  });

  it('should display error message when getMemberByCode fails', async () => {
    window.localStorage.setItem('parpass_code', 'INVALID');

    (api.getMemberByCode as jest.Mock).mockRejectedValueOnce(
      new Error('Member not found')
    );

    render(<FavoritesPage />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Could not load favorites')).toBeInTheDocument();
    });

    // Should show "Sign In" button
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();

    // Should not call getMemberFavorites
    expect(api.getMemberByCode).toHaveBeenCalledWith('INVALID');
    expect(api.getMemberFavorites).not.toHaveBeenCalled();
  });

  it('should display error message when getMemberFavorites fails', async () => {
    window.localStorage.setItem('parpass_code', 'ABC123');

    (api.getMemberByCode as jest.Mock).mockResolvedValueOnce(mockMember);
    (api.getMemberFavorites as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch favorites')
    );

    render(<FavoritesPage />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Could not load favorites')).toBeInTheDocument();
    });

    // Verify both API calls were made
    expect(api.getMemberByCode).toHaveBeenCalledWith('ABC123');
    expect(api.getMemberFavorites).toHaveBeenCalledWith('m1');
  });

  it('should display favorite course tiers correctly', async () => {
    window.localStorage.setItem('parpass_code', 'ABC123');

    (api.getMemberByCode as jest.Mock).mockResolvedValueOnce(mockMember);
    (api.getMemberFavorites as jest.Mock).mockResolvedValueOnce(mockFavorites);

    render(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    });

    // Check tier badges
    const tierBadges = screen.getAllByText(/premium|core/);
    expect(tierBadges).toHaveLength(2);
    
    // Premium course should have premium badge
    const premiumBadge = screen.getAllByText('premium')[0];
    expect(premiumBadge).toHaveClass('bg-purple-100', 'text-purple-800');

    // Core course should have core badge  
    const coreBadge = screen.getByText('core');
    expect(coreBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should show loading state initially', () => {
    window.localStorage.setItem('parpass_code', 'ABC123');

    (api.getMemberByCode as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<FavoritesPage />);

    expect(screen.getByText('Loading favorites...')).toBeInTheDocument();
  });

  it('should display page header with ParPass branding', async () => {
    window.localStorage.setItem('parpass_code', 'ABC123');

    (api.getMemberByCode as jest.Mock).mockResolvedValueOnce(mockMember);
    (api.getMemberFavorites as jest.Mock).mockResolvedValueOnce([]);

    render(<FavoritesPage />);

    await waitFor(() => {
      expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    });

    // Check header elements
    expect(screen.getByText('⛳ ParPass')).toBeInTheDocument();
    expect(screen.getByText('⭐ Your Favorites')).toBeInTheDocument();
  });
});
