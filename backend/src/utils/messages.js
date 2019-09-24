/* global module */
const generateMessage = (username, text) => ({ text, createdAt: new Date().getTime(), username });

module.exports = { generateMessage };