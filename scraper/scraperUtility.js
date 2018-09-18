const fetch = require('node-fetch');

const asyncGetHtml = async function asyncFetchtoHtml(url, headers) {
  try {
    const response = await fetch(url, headers);
    const responseHtml = await response.text();
    return responseHtml;
  } catch (e) {
    throw new Error('Fetch failed.');
  }
};

const wait = (ms, ...args) => new Promise(resolve => setTimeout(resolve, ms, ...args));

module.exports = { asyncGetHtml, wait };
