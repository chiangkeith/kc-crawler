const { DEPTH, KEY_WORDS, TARGET_URL } = require('./constants')
const _ = require('lodash')
const Crawler = require("crawler");

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
    maxConnections : 10,
    // rateLimit: 1000,
    jQuery: false,
    retries: 0
});

const wrapper = (url, d) => {
    if (d > -1) {
      let _url = url;
      if (!url || url.indexOf('log') >= 0 || url.indexOf('www.mirrorfiction.com') >= 0) { return; }
      if (url.indexOf('//') === 0) {
        _url = 'https:' + _url;
      }
      c.queue({
        uri: _url,
        callback: (error, res, done) => {
          if(error){
            // console.log('err occurred', _url)
          }else{
            try {
              const dom = new JSDOM(res.body);
              const aLinkArray = dom.window.document.querySelectorAll('a')
              let isContainTarget = false
              console.log('site', d, _url)
              _.map(KEY_WORDS, (o) => {
                if (res.body.indexOf(o) > -1) {
                  isContainTarget = true
                }
              })
              if (isContainTarget) {
                relativeUrl.push( _url)
              }

              _.map(aLinkArray, (a) => {
                seen.exists(a.href, {
                  callback: (err, result) => {
                    if(err){
                      // console.error(err);
                    }else{
                      if (!result[0]) {
                        const u = (a.href.indexOf('/') === 0 && a.href.indexOf('//') !== 0) ? 'https://' + res.request.host + a.href : a.href;
                        wrapper(u, d - 1);
                      }
                    }
                  }
                });
                
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
}


_.map(TARGET_URL, (targUrl) => {
  wrapper(targUrl, DEPTH);
})

c.on('drain',function(){
  console.log('########################################')
  console.log('########################################')
  console.log('########################################')
  console.log('##########', `Carawling finished. total page: ${c.queueSize}`, '##########');
  // console.log('Relative urls:', relativeUrl)
  _.map(relativeUrl, (o) => {
    console.log(o)
  })
});
