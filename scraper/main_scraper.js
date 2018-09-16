/*
 * Usage: node scraper.js 'job title' 'location'
 */

// import { UrlCreator } from './UrlCreator';

const cheerio = require('cheerio');
const UrlCreator = require('./UrlCreator');
const util = require('./scraperUtility');

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

  for (let i = 0; i < 2; i += 1) {
    searchPageIdx += 10;
    queryData.start = searchPageIdx;
    urlInfo.setQueryKeyVals(queryData);
    jobSearchLinks.push(urlInfo.combinedUrlAndQuery());
  }

  return jobSearchLinks;
};

const searchesToRequest = getJobSearchUrls(jobTitle, location, baseUrl);

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
// let scraperIdx = 1;
// const numPagesToScrape = 3;

// const firstStageScrape = async function firstStageScrapeAndCombineResults(allSearchUrls) {
//   getJobInfo(allSearchUrls[scraperIdx])
//     .then((info) => {
//       globalJobInfo = globalJobInfo.concat(info);
//       scraperIdx += 1;
//     })
//     .then(() => {
//       if (scraperIdx < numPagesToScrape) {
//         firstStageScrape(allSearchUrls);
//       }
//     });
// };

const firstStageScrape = async function firstStageScrapeAndCombineResults(allSearchUrls) {
  let combinedInfo = [];

  // asynchronous
  // allSearchUrls.forEach(async (searchUrl) => {
  //   const searchPageInfo = await getJobInfo(searchUrl);
  //   combinedInfo = combinedInfo.concat(await searchPageInfo);
  // });

  // keep this synchronous to not bomb the servers
  for (const searchUrl of allSearchUrls) {
    const searchPageInfo = await getJobInfo(searchUrl);
    combinedInfo = combinedInfo.concat(await searchPageInfo);
    await setTimeout(() => null, 2000);
  }
  return combinedInfo;
};

firstStageScrape(searchesToRequest)
  .then((initialInfo) => {
    const infoWithJobPostUrls = initialInfo.map((obj) => {
      const baseJobPostUrl = 'https://www.indeed.com/viewjob';
      const queryPair = {
        jk: obj.jobKey,
      };

      const jobPostUrlInfo = new UrlCreator(baseJobPostUrl, queryPair);
      return Object.assign(
        { jobPostUrl: jobPostUrlInfo.combinedUrlAndQuery() },
        obj,
      );
    });
    console.log(infoWithJobPostUrls);
  });
// setTimeout(() => console.log(globalJobInfo), 2000);

// For each job posting URL, visit and scrape job name and skills. Populate object of job info

