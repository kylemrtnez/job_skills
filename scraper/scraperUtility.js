const fetch = require('node-fetch');

const asyncGetHtml = async function asyncFetchtoHtml(url) {
  try {
    const response = await fetch(url);
    const responseHtml = await response.text();
    return responseHtml;
  } catch (e) {
    throw new Error('Fetch failed.');
  }
};

module.exports = { asyncGetHtml };
