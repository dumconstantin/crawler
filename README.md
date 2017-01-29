# Web Crawler

A simple web crawler implementation using streams and the d3 library.

### Usage

If you have Docker installed just run in your cmd:

```
docker run -p 8080:8080 -e WEB_PORT=8080 --name webcrawler dumconstantin/webcrawler
```

Using npm:

```
git clone git@github.com:dumconstantin/crawler.git
cd crawler
npm install && npm start
```

### Known issues

There are several known issues:
* Queueing only handles one url at a time
* Error handling is well implemented - currently 'forever' takes care of restarting the system
* 404 currently fails the system
* CPU intensive
* And quite a lot more :)

### Technologies used

* [d3](https://github.com/d3/d3)
* [Docker](https://www.docker.com)
* [Express](http://expressjs.com)
* [Socket.io](http://socket.io)
* [Most](https://github.com/cujojs/most)

### Project breakdown

```
/server.js
```
the logic for serving crawling results to clients

````
/src/crawler.js
```
the crawler and queue subscriptions

```
/src/fn/..
```
the functions used for processing urls

```
/src/streams/...
```
the streams definitions for the crawler and queue

```
/public/..
```
the web client that contains the graph d3 rendering









