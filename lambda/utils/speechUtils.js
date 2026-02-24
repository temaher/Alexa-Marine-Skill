'use strict';

/**
 * speechUtils.js
 * Helpers for building SSML speech strings for Alexa responses.
 */

/**
 * Wraps a speech string in <speak> tags for SSML output.
 * @param {string} text - Plain text or inline SSML markup
 * @returns {string}
 */
function speak(text) {
  return `<speak>${text}</speak>`;
}

/**
 * Returns an SSML <break> tag.
 * @param {string} [duration='500ms'] - CSS time value (e.g. '300ms', '1s')
 * @returns {string}
 */
function pause(duration = '500ms') {
  return `<break time="${duration}"/>`;
}

/**
 * Joins an array of speech fragments with <break> tags between each item.
 * @param {string[]} items
 * @param {string} [breakDuration='300ms']
 * @returns {string}
 */
function formatList(items, breakDuration = '300ms') {
  return items.join(pause(breakDuration));
}

/**
 * Converts a compass heading in degrees to a spoken cardinal direction.
 * @param {number} degrees - 0–360
 * @returns {string} e.g. 'north', 'east-northeast'
 */
function degreesToCardinal(degrees) {
  const directions = [
    'north',
    'north-northeast',
    'northeast',
    'east-northeast',
    'east',
    'east-southeast',
    'southeast',
    'south-southeast',
    'south',
    'south-southwest',
    'southwest',
    'west-southwest',
    'west',
    'west-northwest',
    'northwest',
    'north-northwest',
  ];
  const index = Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}

/**
 * Wraps a number in SSML <say-as interpret-as="unit"> for better pronunciation.
 * @param {number} value
 * @param {string} unit - e.g. 'knots', 'feet'
 * @returns {string}
 */
function sayWithUnit(value, unit) {
  return `${value} ${unit}`;
}

module.exports = {
  speak,
  pause,
  formatList,
  degreesToCardinal,
  sayWithUnit,
};
