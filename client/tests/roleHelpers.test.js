/**
 * Tests for role helper functions
 */
import { describe, it, expect } from 'vitest';
import { 
  getRoleEmoji, 
  getRoleColor, 
  getRoleTextColor, 
  getRoleBadgeColor 
} from '../src/utils/roleHelpers';

describe('Role Helpers', () => {
  describe('getRoleEmoji', () => {
    it('should return correct emoji for known roles', () => {
      expect(getRoleEmoji('ชาวบ้าน')).toBe('👨‍🌾');
      expect(getRoleEmoji('มนุษย์หมาป่า')).toBe('🐺');
      expect(getRoleEmoji('หมอดู')).toBe('🔮');
    });

    it('should return default emoji for unknown role', () => {
      expect(getRoleEmoji('UnknownRole')).toBe('❓');
    });
  });

  describe('getRoleColor', () => {
    it('should return correct gradient for known roles', () => {
      expect(getRoleColor('ชาวบ้าน')).toBe('from-green-500 to-emerald-500');
      expect(getRoleColor('มนุษย์หมาป่า')).toBe('from-red-500 to-rose-500');
    });

    it('should return default gradient for unknown role', () => {
      expect(getRoleColor('UnknownRole')).toBe('from-gray-500 to-slate-500');
    });
  });

  describe('getRoleTextColor', () => {
    it('should return correct text color for known roles', () => {
      expect(getRoleTextColor('ชาวบ้าน')).toBe('text-green-400');
      expect(getRoleTextColor('มนุษย์หมาป่า')).toBe('text-red-400');
    });
  });

  describe('getRoleBadgeColor', () => {
    it('should return correct badge color for known roles', () => {
      expect(getRoleBadgeColor('ชาวบ้าน')).toBe('bg-green-900/50 border-green-600 text-green-300');
      expect(getRoleBadgeColor('มนุษย์หมาป่า')).toBe('bg-red-900/50 border-red-600 text-red-300');
    });
  });
});

