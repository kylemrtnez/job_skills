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

  for (let i = 0; i < 1; i += 1) {
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
    await util.wait(2000);
    const searchPageInfo = await getJobInfo(searchUrl);
    combinedInfo = combinedInfo.concat(await searchPageInfo);
  }
  return combinedInfo;
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

const secondStageScrape = async function secondStageScrapeNeedsNewName(jobInfoObj) {
  const jobPostHtml = await util.asyncGetHtml(jobInfoObj.jobPostUrl);
  const $ = cheerio.load(await jobPostHtml);

  const secondaryJobInfo = {};
  const jobSkills = [];
  // SKILLS as single strings in a loop
  await $('.jobsearch-DesiredExperience-item').each((i, ele) => {
    jobSkills.push($(ele).text());
  });
  secondaryJobInfo.skills = jobSkills;


  secondaryJobInfo.positionTitle = $('.jobsearch-JobInfoHeader-title').text();
  secondaryJobInfo.date = $('.jobsearch-JobMetadataFooter').text();

  return Object.assign(secondaryJobInfo, jobInfoObj);
};

let delay = 0;



firstStageScrape(searchesToRequest)
  .then((initialInfo) => {
    const infoWithJobPostUrls = initialInfo.map(getJobPostUrl);

    const completedJobInfo = infoWithJobPostUrls.map(async (obj) => {
      delay += 15000;
      await util.wait(delay);
      const secondaryJobInfo = await secondStageScrape(obj);

      // const jobPostHtml = await util.asyncGetHtml(obj.jobPostUrl);
      // const $ = cheerio.load(await jobPostHtml);

      // const secondaryJobInfo = {};
      // const jobSkills = [];
      // // SKILLS as single strings in a loop
      // await $('.jobsearch-DesiredExperience-item').each((i, ele) => {
      //   jobSkills.push($(ele).text());
      // });
      // secondaryJobInfo.skills = jobSkills;


      // secondaryJobInfo.positionTitle = $('.jobsearch-JobInfoHeader-title').text();
      // secondaryJobInfo.date = $('.jobsearch-JobMetadataFooter').text();

      return Object.assign(await secondaryJobInfo, obj);
    });

    // console.log(infoWithJobPostUrls);
    return Promise.all(completedJobInfo);
  }).then((completedInfo) => {
    console.log(completedInfo);
  });
// setTimeout(() => console.log(globalJobInfo), 2000);

// For each job posting URL, visit and scrape job name and skills. Populate object of job info

