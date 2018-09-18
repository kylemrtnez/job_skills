/*
 * Usage: node scraper.js 'job title' 'location' [integer]
 */

// import { UrlCreator } from './UrlCreator';

const cheerio = require('cheerio');
const UrlCreator = require('./UrlCreator');
const util = require('./scraperUtility');

if (process.argv.length < 4 || process.argv.length > 5) {
  throw new Error('Invalid usage, try again. node main_scraper.js "job title" "location" [integer].');
}

// Generate URLs to search and scrape

const jobTitle = process.argv[2];
const location = process.argv[3];
const pagesToFetch = process.argv[4] || 4;
const baseUrl = 'https://www.indeed.com/jobs';

const getJobSearchUrls = function generateArrayOfJobSearchPages(title, loc, url, pages) {
  const jobSearchLinks = [];
  let searchPageIdx = 0;

  const queryData = {
    q: title.split(' ').join('+'),
    l: loc.split(' ').join('+'),
    sort: 'date',
    explvl: 'entry_level',
    start: searchPageIdx,
  };

  // initial page
  const urlInfo = new UrlCreator(url, queryData);
  jobSearchLinks.push(urlInfo.combinedUrlAndQuery());

  // subsequent pages
  for (let i = 0; i < pages; i += 1) {
    searchPageIdx += 10;
    queryData.start = searchPageIdx;
    urlInfo.setQueryKeyVals(queryData);
    jobSearchLinks.push(urlInfo.combinedUrlAndQuery());
  }

  return jobSearchLinks;
};

const searchesToRequest = getJobSearchUrls(jobTitle, location, baseUrl, pagesToFetch);

const scrapeJobInfo = function scrapeJobSearchResults(html) {
  const scrubCompany = function scrubScrapedCompanyName(companyString) {
    return companyString.trim();
  };

  const scrubLocation = function scrubScrapedLocation(locationString) {
    const locationRe = /^.*[A-Z]{2}/;
    let scrubbed;

    try {
      scrubbed = locationString.trim().match(locationRe)[0];
    } catch (e) {
      scrubbed = `SCRUB ERROR - ${locationString.trim()}`;
    }

    return scrubbed;
  };

  const scrubDate = function scrubScrapedDate(dateString) {
    return dateString.trim();
  };

  const scrubTitle = function scrubScrapedPositionTitle(titleString) {
    return titleString.trim();
  };

  const arrayOfScrapedInfo = [];
  const $ = cheerio.load(html);
  const indeedJobKeyField = 'data-jk';
  const indeedLocationHtmlClass = '.location';
  const indeedCompanyNameHtmlClass = '.company';
  const indeedDateHtmlClass = '.date';

  $(`[${indeedJobKeyField}]`).each((i, element) => {
    const jobStuff = {};
    jobStuff.jobKey = element.attribs[indeedJobKeyField];

    const rawLocation = $(element).find(indeedLocationHtmlClass).text();
    jobStuff.location = scrubLocation(rawLocation);

    const rawCompanyName = $(element).find(indeedCompanyNameHtmlClass).text();
    jobStuff.companyName = scrubCompany(rawCompanyName);

    const rawDate = $(element).find(indeedDateHtmlClass).text();
    jobStuff.date = scrubDate(rawDate);

    const rawTitle = $(element).find('a[title]')[0].attribs.title;
    jobStuff.positionTitle = scrubTitle(rawTitle);

    arrayOfScrapedInfo.push(jobStuff);
  });

  return arrayOfScrapedInfo;
};

const getJobInfo = async function requestAndScrapeInfo(singleSearchUrl) {
  const searchPageHeaders = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    referer: 'https://www.indeed.com/',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
  };

  let jobInfo = null;
  try {
    const jobInfoHtml = await util.asyncGetHtml(singleSearchUrl, searchPageHeaders);
    jobInfo = scrapeJobInfo(await jobInfoHtml);
  } catch (e) {
    throw new Error(`Request and scrape failed.\n${e}`);
  }

  return jobInfo;
};

const firstStageScrape = async function firstStageScrapeAndCombineResults(allSearchUrls) {
  let combinedInfo = [];

  // keep this synchronous to not bomb the servers
  for (const searchUrl of allSearchUrls) {
    await util.wait(2000);
    const searchPageInfo = await getJobInfo(searchUrl);
    combinedInfo = combinedInfo.concat(await searchPageInfo);
  }
  return combinedInfo;

  // asynchronous
  // allSearchUrls.forEach(async (searchUrl) => {
  //   const searchPageInfo = await getJobInfo(searchUrl);
  //   combinedInfo = combinedInfo.concat(await searchPageInfo);
  // });
};

const getJobPostUrl = function createJobPostUrl(jobInfoObj) {
  const baseJobPostUrl = 'https://www.indeed.com/viewjob';
  const queryPair = {
    jk: jobInfoObj.jobKey,
  };

  const jobPostUrlInfo = new UrlCreator(baseJobPostUrl, queryPair);
  const modifiedJobObj = Object.assign(
    { jobPostUrl: jobPostUrlInfo.combinedUrlAndQuery() },
    jobInfoObj,
  );

  return modifiedJobObj;
};

firstStageScrape(searchesToRequest)
  .then((initialInfo) => {
    const infoWithJobPostUrls = initialInfo.map(getJobPostUrl);
    console.log(infoWithJobPostUrls);
  });
