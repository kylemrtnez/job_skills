/*
 * Usage: node scraper.js 'job title' 'location'
 */

// import { UrlCreator } from './UrlCreator';

const UrlCreator = require('./UrlCreator');
const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');

if (process.argv.length !== 4) {
  throw new Error('Invalid usage, try again. node main_scraper.js "job title" "location".');
}

const jobTitle = process.argv[2];
const location = process.argv[3];
const baseUrl = 'https://www.indeed.com/jobs';

const getJobSearchUrls = function generateArrayOfJobSearchPages(title, loc, url) {
  const jobSearchLinks = [];
  let searchPageIdx = 0;

  const queryData = {
    q: title.split(' ').join('+'),
    l: loc.split(' ').join('+'),
    start: searchPageIdx,
  };

  const urlInfo = new UrlCreator(url, queryData);
  jobSearchLinks.push(urlInfo.combinedUrlAndQuery());

  for (let i = 0; i < 4; i++) {
    searchPageIdx += 10;
    queryData.start = searchPageIdx;
    urlInfo.setQueryKeyVals(queryData);
    jobSearchLinks.push(urlInfo.combinedUrlAndQuery());
  }

  return jobSearchLinks;
};

const searchesToRequest = getJobSearchUrls(jobTitle, location, baseUrl);


console.log(searchesToRequest);




// how to view a specific job page:
// 'https://www.indeed.com/viewjob?jk=' random chars
// const createJobSearchUrl = function constructJobSearchUrl(title, loc) {

//   const urlifyJobTitle = function addPlusSignsToJobTitleForSearchString(localTitle) {
//     return `q=${localTitle.split(' ').join('+')}`;
//   };

//   const urlifyLocation = function urlifyLocationForSearchString(localLocation) {
//     return `l=${localLocation.split(' ').join('+')}`;
//   };

//   return `${baseUrl}/jobs?${urlifyJobTitle(title)}&${urlifyLocation(loc)}`;
// };

// const crawlForward = function crawlPageForward(url, val) {
//   return `${url}&start=${val}`;
// };




// Take Array of URLs, scrape info off them from each posting. Populates object of job info


// For each job posting URL, visit and scrape job name and skills. Populate object of job info


