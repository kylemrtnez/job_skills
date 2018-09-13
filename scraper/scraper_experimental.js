/*
 * Usage: node scraper.js 'job title' 'location'
 */
// import fetch from 'node-fetch';
const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');

// const baseUrl = 'https://www.indeed.com/';

// how to view a specific job page:
// 'https://www.indeed.com/viewjob?jk=' random chars
const createJobSearchUrl = function constructJobSearchUrl(title, loc) {
  const baseUrl = 'https://www.indeed.com';

  const urlifyJobTitle = function addPlusSignsToJobTitleForSearchString(localTitle) {
    return `q=${localTitle.split(' ').join('+')}`;
  };

  const urlifyLocation = function urlifyLocationForSearchString(localLocation) {
    return `l=${localLocation.split(' ').join('+')}`;
  };

  return `${baseUrl}/jobs?${urlifyJobTitle(title)}&${urlifyLocation(loc)}`;
};

const crawlForward = function crawlPageForward(url, val) {
  return `${url}&start=${val}`;
};


const jobTitle = process.argv[2];
const location = process.argv[3];
const extractedJobInfo = [];
const jobSearchUrl = createJobSearchUrl(jobTitle, location);
const crawlForwardVal = 0;
let idx = 1;

const getJobLinks = async function getJobLinksOnPage(url, crawlVal) {
  fetch(url)
    .then(res => res.text())
    .then((html) => {
      const $ = cheerio.load(html);
      const indeedJobKeyField = 'data-jk';
      const indeedLocationHtmlClass = '.location';

      const selectHtmlBy = function selectHtmlDataBySelector(selector) {
        return $(`${selector}`);
      };

      const rawJobInfo = selectHtmlBy(`[${indeedJobKeyField}]`);
      // console.log(rawJobInfo);

      const rawLocationInfo = selectHtmlBy(indeedLocationHtmlClass);
      console.log(rawLocationInfo.contents().text());

      // extract job keys to create specific job page links
      rawJobInfo.each((i, element) => {
        extractedJobInfo.push(element.attribs[indeedJobKeyField]);
      });

      // console.log(extractedJobInfo);
    })
    // .then(() => {
    //   if (idx < 3) {
    //     idx += 1;
    //     const newCrawlVal = crawlVal + 10;
    //     const nextUrl = crawlForward(url, newCrawlVal);
    //     console.log(nextUrl);
    //     getJobLinks(nextUrl, newCrawlVal);
    //   }
    // })
    .catch(error => console.error(error));
};

getJobLinks(jobSearchUrl, crawlForwardVal);
