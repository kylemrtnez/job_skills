const fs = require('fs');

class ScraperRequestHeaders {
  constructor(headers) {
    this.headers = headers;
    this.uaTxtFile = 'uaList.txt';
    if (this.headers['User-Agent'] === 'randomize') {
      this.headers['User-Agent'] = this.randomizeUA();
    }
  }

  randomizeUA() {
    const getRandomInt = function getRandomInt(min, max) {
      const intMin = Math.floor(min);
      const intMax = Math.ceil(max);
      return Math.floor(Math.random() * (intMax - intMin)) + intMin;
    };

    let userAgents;

    try {
      userAgents = fs.readFileSync(this.uaTxtFile);
    } catch (e) {
      throw new Error(`Unable to read UA file ${this.uaTxtFile}`);
    }

    const maxIdx = userAgents.length - 1;
    const randomIdx = getRandomInt(0, maxIdx);
    let randomUa;

    try {
      randomUa = userAgents[randomIdx];
    } catch (e) {
      throw new Error(`Index out of bounds for randomized UA: 
                       Index: ${randomIdx} Len: ${userAgents.length}`);
    }

    return randomUa;
  }

  setReferer(ref) {
    this.headers.referer = ref;
  }
}

module.exports = ScraperRequestHeaders;
