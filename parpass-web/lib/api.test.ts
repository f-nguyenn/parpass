import { getCourses, getMemberByCode, Course, Member } from './api';

describe('API Functions', () => {
  describe('getCourses', () => {
    it('should return a list of courses without filter', async () => {
      const mockCourses: Course[] = [
        {
          id: '1',
          name: 'Pine Valley Golf Club',
          city: 'Pine Valley',
          state: 'NJ',
          zip: '08021',
          holes: 18,
          tier_required: 'premium',
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
          tier_required: 'core',
          phone: '831-624-3811',
          latitude: '36.5674',
          longitude: '-121.9489',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCourses,
      });

      const courses = await getCourses();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/courses',
        { cache: 'no-store' }
      );
      expect(courses).toEqual(mockCourses);
      expect(courses).toHaveLength(2);
    });

    it('should return a list of courses filtered by tier', async () => {
      const mockPremiumCourses: Course[] = [
        {
          id: '1',
          name: 'Pine Valley Golf Club',
          city: 'Pine Valley',
          state: 'NJ',
          zip: '08021',
          holes: 18,
          tier_required: 'premium',
          phone: '856-783-3000',
          latitude: '39.7828',
          longitude: '-74.8939',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPremiumCourses,
      });

      const courses = await getCourses('premium');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/courses?tier=premium',
        { cache: 'no-store' }
      );
      expect(courses).toEqual(mockPremiumCourses);
      expect(courses).toHaveLength(1);
      expect(courses[0].tier_required).toBe('premium');
    });

    it('should return core tier courses when filtered by core', async () => {
      const mockCoreCourses: Course[] = [
        {
          id: '2',
          name: 'Pebble Beach',
          city: 'Pebble Beach',
          state: 'CA',
          zip: '93953',
          holes: 18,
          tier_required: 'core',
          phone: '831-624-3811',
          latitude: '36.5674',
          longitude: '-121.9489',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoreCourses,
      });

      const courses = await getCourses('core');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/courses?tier=core',
        { cache: 'no-store' }
      );
      expect(courses).toEqual(mockCoreCourses);
      expect(courses[0].tier_required).toBe('core');
    });
  });

  describe('getMemberByCode', () => {
    it('should successfully retrieve member data for a valid code', async () => {
      const mockMember: Member = {
        id: 'm1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        parpass_code: 'ABC123',
        status: 'active',
        health_plan_name: 'Blue Cross',
        tier: 'premium',
        monthly_rounds: 8,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMember,
      });

      const member = await getMemberByCode('ABC123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/members/code/ABC123',
        { cache: 'no-store' }
      );
      expect(member).toEqual(mockMember);
      expect(member.parpass_code).toBe('ABC123');
      expect(member.first_name).toBe('John');
      expect(member.tier).toBe('premium');
    });

    it('should handle an invalid member code gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Member not found' }),
      });

      await expect(getMemberByCode('INVALID')).rejects.toThrow('Member not found');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/members/code/INVALID',
        { cache: 'no-store' }
      );
    });

    it('should throw error for network failures', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(getMemberByCode('ABC123')).rejects.toThrow('Member not found');
    });
  });
});
