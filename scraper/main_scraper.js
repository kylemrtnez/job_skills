/*
 * Usage: node scraper.js 'job title' 'location'
 */

// import { UrlCreator } from './UrlCreator';

const UrlCreator = require('./UrlCreator');
const util = require('./scraperUtility');
const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');

if (process.argv.length !== 4) {
  throw new Error('Invalid usage, try again. node main_scraper.js "job title" "location".');
}

// Generate URLs to search and scrape

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

// Take Array of URLs, scrape info off them from each posting. Populates object of job info

// const asyncGetHtml = async function asyncFetchtoHtml(url) {
//   try {
//     const response = await fetch(url);
//     const responseHtml = await response.text();
//     return responseHtml;
//   } catch (e) {
//     throw new Error('Fetch failed.');
//   }
// };


const scrapeJobInfo = function scrapeJobSearchResults(html) {
  const scrubCompany = function scrubScrapedCompanyName(companyString) {
    return companyString.trim();
  };

  const scrubLocation = function scrubScrapedLocation(locationString) {
    const locationRe = /^.*[A-Z]{2}/;
    return locationString.trim().match(locationRe)[0];
  };

  const arrayOfScrapedInfo = [];
  const $ = cheerio.load(html);
  const indeedJobKeyField = 'data-jk';
  const indeedLocationHtmlClass = '.location';
  const indeedCompanyNameHtmlClass = '.company';

  $(`[${indeedJobKeyField}]`).each((i, element) => {
    const jobStuff = {};
    jobStuff.jobKey = element.attribs[indeedJobKeyField];

    const rawLocation = $(element).find(indeedLocationHtmlClass).text()
    jobStuff.location = scrubLocation(rawLocation);

    const rawCompanyName = $(element).find(indeedCompanyNameHtmlClass).text()
    jobStuff.companyName = scrubCompany(rawCompanyName);

    arrayOfScrapedInfo.push(jobStuff);
  });

  return arrayOfScrapedInfo;
};

const getJobInfo = async function requestAndScrapeInfo(singleSearchUrl) {
  // return scrapeJobInfo(await asyncGetHtml(searchUrl));
  const jobInfoHtml = await util.asyncGetHtml(singleSearchUrl);
  const jobInfo = scrapeJobInfo(await jobInfoHtml);
  return jobInfo;
};

let globalJobInfo = [];
let scraperIdx = 1;
const numPagesToScrape = 3;

const firstStageScrape = function firstStageScrapeAndCombineResults(allSearchUrls) {
  getJobInfo(allSearchUrls[scraperIdx])
    .then((info) => {
      globalJobInfo = globalJobInfo.concat(info);
      scraperIdx += 1;
    })
    .then(() => {
      if (scraperIdx < numPagesToScrape) {
        firstStageScrape(allSearchUrls);
      }
    });
};

firstStageScrape(searchesToRequest);
setTimeout(() => console.log(globalJobInfo), 2000);

// For each job posting URL, visit and scrape job name and skills. Populate object of job info





// const scrapeJobInfo = async function scrapeJobSearchResults(urls) {
//   const requestsToMake = searchesToRequest.length;

//   fetch(url)
//     .then(res => res.text())
//     .then((html) => {
//       const $ = cheerio.load(html);
//       const indeedJobKeyField = 'data-jk';
//       const indeedLocationHtmlClass = '.location';

//       const selectHtmlBy = function selectHtmlDataBySelector(selector) {
//         return $(`${selector}`);
//       };

//       const rawJobInfo = selectHtmlBy(`[${indeedJobKeyField}]`);
//       // console.log(rawJobInfo);

//       const rawLocationInfo = selectHtmlBy(indeedLocationHtmlClass);
//       console.log(rawLocationInfo.contents().text());

//       // extract job keys to create specific job page links
//       rawJobInfo.each((i, element) => {
//         extractedJobInfo.push(element.attribs[indeedJobKeyField]);
//       });

//       // console.log(extractedJobInfo);
//     })
//     // .then(() => {
//     //   if (idx < 3) {
//     //     idx += 1;
//     //     const newCrawlVal = crawlVal + 10;
//     //     const nextUrl = crawlForward(url, newCrawlVal);
//     //     console.log(nextUrl);
//     //     getJobLinks(nextUrl, newCrawlVal);
//     //   }
//     // })
//     .catch(error => console.error(error));
// };
// console.log(searchesToRequest);






