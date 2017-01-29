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

### Technologies used

* [d3](https://github.com/d3/d3)
* [Docker](https://www.docker.com)
* [Express](http://expressjs.com)
* [Socket.io](http://socket.io)
* [Most](https://github.com/cujojs/most)
