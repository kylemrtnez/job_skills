/*
 * Usage: node scraper.js 'job title' 'location'
 */
const cheerio = require('cheerio');
const util = require('./scraperUtility');
const fs = require('fs');

const testUrl = 'https://www.indeed.com/viewjob?jk=8f841e0cd020e39b';

const testHtml = fs.readFileSync('testJobPage.html');

const $ = cheerio.load(testHtml);

// SKILLS as single strings in a loop
$('.jobsearch-DesiredExperience-item').each((i, ele) => {
  console.log($(ele).text());
}) 

console.log($('.jobsearch-JobInfoHeader-title').text());
console.log($('.jobsearch-JobMetadataFooter').text());
