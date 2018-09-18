

const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('testinghtml.html');
const $ = cheerio.load(html);
const indeedJobKeyField = 'data-jk';
const indeedLocationHtmlClass = '.location';

// const rawJobInfo = selectHtmlBy(`[${indeedJobKeyField}]`);
// console.log(rawJobInfo);

// const rawLocationInfo = selectHtmlBy(indeedLocationHtmlClass);
// console.log(rawLocationInfo.contents().text());

// console.log($('.location').contents().text());

// $(`[${indeedJobKeyField}]`).each((i, element) => {
//   const jobStuff = {};
//   const locationRe = /^.*[A-Z]{2}/;
//   jobStuff.jobKey = element.attribs[indeedJobKeyField];
//   jobStuff.location = $(element).find('.location').text().trim()
//     .match(locationRe)[0];
//   jobStuff.companyName = $(element).find('.company').text().trim();
//   console.log(jobStuff);
// });

// const arrayOfScrapedInfo = [];
// const indeedCompanyNameHtmlClass = '.company';

// const scrubCompany = function scrubScrapedCompanyName(companyString) {
//   return companyString.trim();
// };

// const scrubLocation = function scrubScrapedLocation(locationString) {
//   const locationRe = /^.*[A-Z]{2}/;
//   return locationString.trim().match(locationRe)[0];
// };

// $(`[${indeedJobKeyField}]`).each((i, element) => {
//   const jobStuff = {};
//   jobStuff.jobKey = element.attribs[indeedJobKeyField];

//   const rawLocation = $(element).find(indeedLocationHtmlClass).text();
//   jobStuff.location = scrubLocation(rawLocation);

//   const rawCompanyName = $(element).find(indeedCompanyNameHtmlClass).text();
//   jobStuff.companyName = scrubCompany(rawCompanyName);

//   arrayOfScrapedInfo.push(jobStuff);
// });

// console.log(arrayOfScrapedInfo);




const fss = require('fs');
const UrlCreator = require('./UrlCreator');
const util = require('./scraperUtility');

const testUrl = 'https://www.indeed.com/viewjob?jk=8f841e0cd020e39b';
const testUrl2 = 'https://www.indeed.com/viewjob?jk=a76b1ebe3c6e02c8';
const testUrl3 = 'https://www.indeed.com/viewjob?jk=01e768cc8d7c3504';

const jobPostMeta = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9',
  Connection: 'keep-alive',
  // 'Cache-Control': 'max-age=0',
  Host: 'www.indeed.com',
  // TE: 'Trailers',
  // referer: 'https://www.indeed.com/',
  'Upgrade-Insecure-Requests': 1,
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
};

util.asyncGetHtml(testUrl3, jobPostMeta)
  .then((info) => {
    fss.writeFile('testJobPage3.html', info, (err) => {
      if (err) throw err;
    });
    console.log('File saved.');
  });



const getJobSearchUrls = function generateArrayOfJobSearchPages(url, queryKeyVals) {
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
