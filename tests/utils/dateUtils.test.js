'use strict';

const {
  toNoaaFormat,
  todayNoaaFormat,
  tomorrowNoaaFormat,
  formatTideTime,
  formatRelativeDay,
} = require('../../lambda/utils/dateUtils');

describe('dateUtils', () => {
  describe('toNoaaFormat', () => {
    test('formats a known date correctly', () => {
      const d = new Date(2024, 5, 1); // June 1 2024
      expect(toNoaaFormat(d)).toBe('20240601');
    });

    test('pads single-digit month and day with zeros', () => {
      const d = new Date(2024, 0, 9); // Jan 9 2024
      expect(toNoaaFormat(d)).toBe('20240109');
    });
  });

  describe('todayNoaaFormat', () => {
    test('returns an 8-character string', () => {
      expect(todayNoaaFormat()).toHaveLength(8);
    });

    test('returns a numeric string', () => {
      expect(todayNoaaFormat()).toMatch(/^\d{8}$/);
    });
  });

  describe('tomorrowNoaaFormat', () => {
    test('returns a date one day after today', () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(tomorrowNoaaFormat()).toBe(toNoaaFormat(tomorrow));
    });

    test('returns an 8-digit numeric string', () => {
      expect(tomorrowNoaaFormat()).toMatch(/^\d{8}$/);
    });
  });

  describe('formatTideTime', () => {
    test('formats a noon timestamp as 12:00 PM', () => {
      expect(formatTideTime('2024-06-01 12:00')).toBe('12:00 PM');
    });

    test('formats a midnight timestamp as 12:00 AM', () => {
      expect(formatTideTime('2024-06-01 00:00')).toBe('12:00 AM');
    });

    test('formats afternoon time correctly', () => {
      expect(formatTideTime('2024-06-01 15:30')).toBe('3:30 PM');
    });

    test('formats morning time correctly', () => {
      expect(formatTideTime('2024-06-01 06:45')).toBe('6:45 AM');
    });

    test('returns "unknown time" for null', () => {
      expect(formatTideTime(null)).toBe('unknown time');
    });

    test('returns "unknown time" for empty string', () => {
      expect(formatTideTime('')).toBe('unknown time');
    });

    test('returns "unknown time" for a timestamp with no time part', () => {
      expect(formatTideTime('2024-06-01')).toBe('unknown time');
    });
  });

  describe('formatRelativeDay', () => {
    test('returns "unknown day" for null', () => {
      expect(formatRelativeDay(null)).toBe('unknown day');
    });

    test('returns "unknown day" for empty string', () => {
      expect(formatRelativeDay('')).toBe('unknown day');
    });

    test('returns "today" for today', () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      expect(formatRelativeDay(`${yyyy}-${mm}-${dd} 10:00`)).toBe('today');
    });

    test('returns "tomorrow" for tomorrow', () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      expect(formatRelativeDay(`${yyyy}-${mm}-${dd} 10:00`)).toBe('tomorrow');
    });

    test('returns a weekday name for a further-out date', () => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const d = new Date();
      d.setDate(d.getDate() + 5);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      expect(dayNames).toContain(formatRelativeDay(`${yyyy}-${mm}-${dd} 08:00`));
    });
  });
});
