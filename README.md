# kc-crawler
This is just an app to crawl something for fun by [https://github.com/bda-research/node-crawler](https://github.com/bda-research/node-crawler).

#Redis
Would need to install Redis:
```
https://redis.io/download
```
```
redis-cli flushall
```

this app may cost lots of js memory and cause memory leak, so we can use the following command to run:
```
node --max-old-space-size=4096 server.js
```