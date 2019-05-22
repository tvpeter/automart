/**
 * @description - function to verify email addresses
 * @param {string} -email
 * @return {boolean}
 */

const emailIsValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default emailIsValid;
