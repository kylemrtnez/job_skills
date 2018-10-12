const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const ScraperRequestHeaders = require('../scraper/ScraperHeaders.js');

const UA_TXT_FILE = '/home/kozzman/code/job_skills_project/test/test_user_agents.txt';

function setUpTestUaArray() {
  return [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
    'Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
  ];
}

describe('Test loading user agents from file', () => {
  it('should load 10 user agents', () => {
    const testHeaderObj = new ScraperRequestHeaders({}, UA_TXT_FILE);
    const loadedFromFile = testHeaderObj.loadUserAgentsFromTxtFile();
    loadedFromFile.length.should.equal(10);
  });

  it('should load specific user agents', () => {
    const testUserAgents = setUpTestUaArray();

    const testHeaderObj = new ScraperRequestHeaders({}, UA_TXT_FILE);
    const loadedFromFile = testHeaderObj.loadUserAgentsFromTxtFile();

    for (let idx = 0; idx < testUserAgents.length; idx += 1) {
      loadedFromFile[idx].should.equal(testUserAgents[idx]);
    }
  });
});
