

class UrlCreator {
  constructor(baseUrl, queryKeyVals) {
    this.baseUrl = baseUrl;
    this.queryKeyVals = queryKeyVals;
  }

  getQueryKeyVals() {
    return this.queryKeyVals;
  }

  setQueryKeyVals(keyVals) {
    this.queryKeyVals = keyVals;
  }

  combinedUrlAndQuery() {
    // const queryString =
    const getQueryString = function stringifyKeyVals(keyVals) {
      const pairsAsStr = [];
      const keyArr = Object.keys(keyVals);

      keyArr.forEach((key) => {
        const val = keyVals[`${key}`];
        pairsAsStr.push(`${key}=${val}`);
      });
      return pairsAsStr.join('&');
    };

    return `${this.baseUrl}?${getQueryString(this.queryKeyVals)}`;
  }
}

// export default UrlCreator;
module.exports = UrlCreator;

// const params = {
//   q: 'jobTitle',
//   l: 'location',
//   jk: 'jobKey',
// };

// const testUrl = new UrlCreator('https://www.indeed.com', params);
// const testSearchUrl = testUrl.combinedUrlAndQuery();
// console.log(testSearchUrl);
