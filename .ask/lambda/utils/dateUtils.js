/**
 * dateUtils.js
 * Date/time formatting helpers for NOAA API calls and Alexa speech output.
 */

/**
 * Returns a Date formatted as YYYYMMDD for NOAA API query parameters.
 * @param {Date} [date=new Date()]
 * @returns {string} e.g. '20240601'
 */
function toNoaaFormat(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * Returns today's date as YYYYMMDD.
 * @returns {string}
 */
function todayNoaaFormat() {
  return toNoaaFormat(new Date());
}

/**
 * Returns tomorrow's date as YYYYMMDD.
 * @returns {string}
 */
function tomorrowNoaaFormat() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toNoaaFormat(d);
}

/**
 * Converts a NOAA timestamp string ('YYYY-MM-DD HH:MM') into a spoken time string.
 * @param {string} noaaTimestamp
 * @returns {string} e.g. '3:45 PM'
 */
function formatTideTime(noaaTimestamp) {
  if (!noaaTimestamp) return 'unknown time';
  const parts = noaaTimestamp.split(' ');
  const timePart = parts[1];
  if (!timePart) return 'unknown time';

  const [hourStr, minute] = timePart.split(':');
  const hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return 'unknown time';

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
}

/**
 * Returns a spoken date description relative to today.
 * @param {string} noaaTimestamp - 'YYYY-MM-DD HH:MM'
 * @returns {string} 'today', 'tomorrow', or 'Monday' etc.
 */
function formatRelativeDay(noaaTimestamp) {
  if (!noaaTimestamp) return 'unknown day';
  const datePart = noaaTimestamp.split(' ')[0];
  if (!datePart) return 'unknown day';

  const [yyyy, mm, dd] = datePart.split('-').map(Number);
  const eventDate = new Date(yyyy, mm - 1, dd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = eventDate - today;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[eventDate.getDay()];
}

module.exports = {
  toNoaaFormat,
  todayNoaaFormat,
  tomorrowNoaaFormat,
  formatTideTime,
  formatRelativeDay,
};
