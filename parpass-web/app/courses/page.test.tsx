import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoursesPage from './page';
import * as api from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  getCourses: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('CoursesPage', () => {
  const mockCourses = [
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
    {
      id: '3',
      name: 'Augusta National',
      city: 'Augusta',
      state: 'GA',
      zip: '30904',
      holes: 18,
      tier_required: 'premium' as const,
      phone: '706-667-6000',
      latitude: '33.5029',
      longitude: '-82.0203',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly display all courses on initial load', async () => {
    (api.getCourses as jest.Mock).mockResolvedValueOnce(mockCourses);

    render(<CoursesPage />);

    // Should show loading state initially
    expect(screen.getByText('Loading courses...')).toBeInTheDocument();

    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    });

    // All courses should be displayed
    expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    expect(screen.getByText('Pebble Beach')).toBeInTheDocument();
    expect(screen.getByText('Augusta National')).toBeInTheDocument();

    // Verify getCourses was called without a tier filter
    expect(api.getCourses).toHaveBeenCalledWith(undefined);
    expect(api.getCourses).toHaveBeenCalledTimes(1);
  });

  it('should display course details correctly', async () => {
    (api.getCourses as jest.Mock).mockResolvedValueOnce([mockCourses[0]]);

    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    });

    // Check that course details are rendered
    expect(screen.getByText('Pine Valley, NJ 08021')).toBeInTheDocument();
    expect(screen.getByText('🏌️ 18 holes')).toBeInTheDocument();
    expect(screen.getByText('📞 856-783-3000')).toBeInTheDocument();
    expect(screen.getByText('premium')).toBeInTheDocument();
  });

  it('should filter courses by "core" tier when core button is clicked', async () => {
    const coreCourses = mockCourses.filter(c => c.tier_required === 'core');
    
    // Initial load with all courses
    (api.getCourses as jest.Mock).mockResolvedValueOnce(mockCourses);
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    });

    // Mock the filtered response
    (api.getCourses as jest.Mock).mockResolvedValueOnce(coreCourses);

    // Click the Core filter button
    const coreButton = screen.getByRole('button', { name: /core/i });
    await userEvent.click(coreButton);

    // Wait for filtered results
    await waitFor(() => {
      expect(api.getCourses).toHaveBeenCalledWith('core');
    });

    // Should only show core courses
    await waitFor(() => {
      expect(screen.queryByText('Pine Valley Golf Club')).not.toBeInTheDocument();
      expect(screen.queryByText('Augusta National')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Pebble Beach')).toBeInTheDocument();
    expect(api.getCourses).toHaveBeenCalledTimes(2); // Once for initial, once for filter
  });

  it('should filter courses by "premium" tier when premium button is clicked', async () => {
    const premiumCourses = mockCourses.filter(c => c.tier_required === 'premium');
    
    // Initial load with all courses
    (api.getCourses as jest.Mock).mockResolvedValueOnce(mockCourses);
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    });

    // Mock the filtered response
    (api.getCourses as jest.Mock).mockResolvedValueOnce(premiumCourses);

    // Click the Premium filter button
    const premiumButton = screen.getByRole('button', { name: /premium/i });
    await userEvent.click(premiumButton);

    // Wait for filtered results
    await waitFor(() => {
      expect(api.getCourses).toHaveBeenCalledWith('premium');
    });

    // Should only show premium courses
    await waitFor(() => {
      expect(screen.queryByText('Pebble Beach')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    expect(screen.getByText('Augusta National')).toBeInTheDocument();
    expect(api.getCourses).toHaveBeenCalledTimes(2);
  });

  it('should show all courses when "all" button is clicked after filtering', async () => {
    const coreCourses = mockCourses.filter(c => c.tier_required === 'core');
    
    // Initial load
    (api.getCourses as jest.Mock).mockResolvedValueOnce(mockCourses);
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    });

    // Filter by core
    (api.getCourses as jest.Mock).mockResolvedValueOnce(coreCourses);
    const coreButton = screen.getByRole('button', { name: /core/i });
    await userEvent.click(coreButton);

    await waitFor(() => {
      expect(screen.getByText('Pebble Beach')).toBeInTheDocument();
    });

    // Click "All" to show all courses again
    (api.getCourses as jest.Mock).mockResolvedValueOnce(mockCourses);
    const allButton = screen.getByRole('button', { name: /^all$/i });
    await userEvent.click(allButton);

    await waitFor(() => {
      expect(api.getCourses).toHaveBeenCalledWith(undefined);
    });

    // All courses should be visible again
    await waitFor(() => {
      expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
      expect(screen.getByText('Pebble Beach')).toBeInTheDocument();
      expect(screen.getByText('Augusta National')).toBeInTheDocument();
    });
  });

  it('should highlight the active filter button', async () => {
    (api.getCourses as jest.Mock).mockResolvedValueOnce(mockCourses);
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Pine Valley Golf Club')).toBeInTheDocument();
    });

    const allButton = screen.getByRole('button', { name: /^all$/i });
    const coreButton = screen.getByRole('button', { name: /core/i });
    const premiumButton = screen.getByRole('button', { name: /premium/i });

    // Initially "All" should be active
    expect(allButton).toHaveClass('bg-green-600');
    expect(coreButton).toHaveClass('bg-white');
    expect(premiumButton).toHaveClass('bg-white');

    // Click Core button
    (api.getCourses as jest.Mock).mockResolvedValueOnce([]);
    await userEvent.click(coreButton);

    await waitFor(() => {
      expect(coreButton).toHaveClass('bg-green-600');
      expect(allButton).toHaveClass('bg-white');
      expect(premiumButton).toHaveClass('bg-white');
    });
  });
});
