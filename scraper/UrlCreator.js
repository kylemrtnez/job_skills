/*
 * UrlCreator.js
 * Description: This file contains the declaration/definition of the UrlCreator
 *              class. The purpose of the class is to use the following
 *              arguments and combine them into a valid URL.
 *                baseUrl = the protocol + hostname + path
 *                queryKeyVals = an object containing key : value pairs for the
 *                               query parameters to add onto the end of the
 *                               URL
 */

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

module.exports = UrlCreator;
