const fetch = require('node-fetch');

const asyncGetHtml = async function asyncFetchtoHtml(url, headers) {
  // const meta = {
  //   Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  //   'Accept-Encoding': 'gzip, deflate, br',
  //   'Accept-Language': 'en-US,en;q=0.5',
  //   'Cache-Control': 'max-age=0',
  //   Connection: 'keep-alive',
  //   Host: 'www.indeed.com',
  //   TE: 'Trailers',
  //   referer: 'https://www.indeed.com/',
  //   'Upgrade-Insecure-Requests': 1,
  //   'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
  // };

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
