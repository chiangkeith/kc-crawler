// const { DEPTH, KEY_WORDS, TARGET_URL } = require('./constants')
const _ = require('lodash')
const Crawler = require("crawler");
const numeral = require('numeral');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const seenreq = require('seenreq');
const seen = new seenreq({
    repo: 'redis',// use redis instead of memory
    host: '127.0.0.1',
    port: 6379,
    clearOnQuit: true
});
const relativeUrl = []

console.log('Starting to crawl stuff...')



const c = new Crawler({
    maxConnections : 1,
    // rateLimit: 3000,
    // timeout: 60000,
    // retryTimeout: 180000,
    jQuery: false,
    retries: 0
});

const monthPeriod = [ 1, 13 ]
const yearPeriod = [ 2001, 2019 ]
const gameInfo = []

const fetcher = (m, y) => {
  c.queue({
    uri: `http://www.cpbl.com.tw/schedule/index/${y}-${m}-01.html?&date=${y}-${m}-01&gameno=01&sfieldsub=&sgameno=01`,

    callback: (error, res, done) => {
      if(error){
        console.error('Error occurred', error)
      }else{
        try {
          //table:nth-child(0)
          const dom = new JSDOM(res.body);
          const oneBlock = dom.window.document.querySelectorAll('.one_block')
  
          _.map(oneBlock, b => {
            const stadium = b.querySelector('table:first-child td:nth-child(2)')
            const gameNo = b.querySelector('table:nth-child(2) th:nth-child(2)')
            console.log('stadium', stadium.innerHTML, '#', gameNo.innerHTML)
            gameInfo.push({
              year: y,
              stadium: stadium.innerHTML,
              gameNo: gameNo.innerHTML
            })
          })
  
          dom = null
        } catch (e) {
          if (e.message.indexOf('URIError') > -1) {
            console.log('URIError', a.href)
          }
        }
      }
      done();
    }
  });
}

const year = 2018
// for (let x = yearPeriod[ 0 ]; x < yearPeriod[ 1 ]; x++) {
  for (let y = monthPeriod[ 0 ]; y < monthPeriod[ 1 ]; y++) {
    fetcher(y, year)
  }
// }

c.on('drain', function () {
  console.log('########################################')
  console.log('########################################')
  console.log('########################################')
  console.log('##########', `Carawling finished. Count: ${gameInfo.length}`, '##########');

  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
      path: `/Users/user/Downloads/gameInfo-${year}.csv`,
      header: [
        { id: 'gameNo', title: 'gameNo'},
        { id: 'year', title: 'year'},
        { id: 'stadium', title: 'stadium'},
      ]
  });

  csvWriter.writeRecords(_.sortBy(gameInfo, g => numeral(g.gameNo).value()))       // returns a promise
  .then(() => {
    console.log('...Done');
    process.exit();
  });  
})
