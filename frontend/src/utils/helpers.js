/**
 * CashTrack — Helper / Utility Functions
 * Date formatting, currency formatting, and category lookups.
 */

import { CATEGORIES } from './constants';

/**
 * Format a number as Indian Rupee currency string.
 * @param {number} amount
 * @returns {string}  e.g. "₹1,234.56"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format a Date (or ISO string) as "DD MMM YYYY".
 * @param {Date|string} date
 * @returns {string}  e.g. "22 May 2026"
 */
export const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Format a Date (or ISO string) as "HH:MM AM/PM".
 * @param {Date|string} date
 * @returns {string}  e.g. "02:30 PM"
 */
export const formatTime = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Look up a category object by its name.
 * @param {string} name
 * @returns {object|undefined}
 */
export const getCategoryByName = (name) => {
  return CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === (name || '').toLowerCase()
  );
};

/**
 * Group an array of expenses by date string (DD MMM YYYY).
 * Returns an array of { title, data, total } objects suitable for SectionList.
 */
export const groupExpensesByDate = (expenses) => {
  const groups = {};
  expenses.forEach((exp) => {
    const key = formatDate(exp.date || exp.createdAt);
    if (!groups[key]) {
      groups[key] = { title: key, data: [], total: 0 };
    }
    groups[key].data.push(exp);
    groups[key].total += Number(exp.amount) || 0;
  });
  // Sort groups by date descending
  return Object.values(groups).sort(
    (a, b) => new Date(b.data[0]?.date || b.data[0]?.createdAt) - new Date(a.data[0]?.date || a.data[0]?.createdAt)
  );
};
