const {
  speak, pause, formatList, degreesToCardinal, sayWithUnit,
} = require('../../lambda/utils/speechUtils');

describe('speechUtils', () => {
  describe('speak', () => {
    test('wraps text in SSML speak tags', () => {
      expect(speak('hello')).toBe('<speak>hello</speak>');
    });

    test('wraps empty string', () => {
      expect(speak('')).toBe('<speak></speak>');
    });

    test('preserves embedded SSML tags', () => {
      const input = 'wind is <break time="500ms"/> 12 knots';
      expect(speak(input)).toBe(`<speak>${input}</speak>`);
    });
  });

  describe('pause', () => {
    test('returns a break tag with default duration', () => {
      expect(pause()).toBe('<break time="500ms"/>');
    });

    test('returns a break tag with custom duration', () => {
      expect(pause('1s')).toBe('<break time="1s"/>');
    });

    test('returns a break tag with 300ms duration', () => {
      expect(pause('300ms')).toBe('<break time="300ms"/>');
    });
  });

  describe('formatList', () => {
    test('joins items with default break duration', () => {
      const result = formatList(['one', 'two', 'three']);
      expect(result).toBe('one<break time="300ms"/>two<break time="300ms"/>three');
    });

    test('joins items with custom break duration', () => {
      const result = formatList(['a', 'b'], '500ms');
      expect(result).toBe('a<break time="500ms"/>b');
    });

    test('returns a single item unchanged', () => {
      expect(formatList(['only'])).toBe('only');
    });

    test('returns empty string for empty array', () => {
      expect(formatList([])).toBe('');
    });
  });

  describe('degreesToCardinal', () => {
    test.each([
      [0, 'north'],
      [45, 'northeast'],
      [90, 'east'],
      [135, 'southeast'],
      [180, 'south'],
      [225, 'southwest'],
      [270, 'west'],
      [315, 'northwest'],
      [360, 'north'],
    ])('%i° → %s', (degrees, expected) => {
      expect(degreesToCardinal(degrees)).toBe(expected);
    });

    test('handles north-northeast (22.5°)', () => {
      expect(degreesToCardinal(22.5)).toBe('north-northeast');
    });

    test('handles negative degrees gracefully', () => {
      // -45° should be equivalent to 315° = northwest
      expect(degreesToCardinal(-45)).toBe('northwest');
    });

    test('handles values over 360 gracefully', () => {
      expect(degreesToCardinal(405)).toBe('northeast'); // 405 % 360 = 45
    });
  });

  describe('sayWithUnit', () => {
    test('formats value and unit as a string', () => {
      expect(sayWithUnit(12, 'knots')).toBe('12 knots');
    });

    test('works with decimal values', () => {
      expect(sayWithUnit(4.5, 'feet')).toBe('4.5 feet');
    });
  });
});
