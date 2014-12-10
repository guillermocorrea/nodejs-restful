nodejs-restful
==============

[![Build Status](https://travis-ci.org/guillermocorrea/nodejs-restful.svg?branch=master)](https://travis-ci.org/guillermocorrea/nodejs-restful) [![Coverage Status](https://coveralls.io/repos/guillermocorrea/nodejs-restful/badge.png?branch=master)](https://coveralls.io/r/guillermocorrea/nodejs-restful?branch=master) [![Code Climate](https://codeclimate.com/github/guillermocorrea/nodejs-restful.png)](https://codeclimate.com/github/guillermocorrea/nodejs-restful) [![Codeship status](https://www.codeship.io/projects/2f8f6ec0-bdb0-0131-5ad7-425498ddc89f/status)](https://www.codeship.io/projects/2f8f6ec0-bdb0-0131-5ad7-425498ddc89f/status)

A seed app node.js restful server with continuous integration and code quality metrics throug https://travis-ci.org/, https://coveralls.io/ and https://codeclimate.com.

Install
==============
```
npm install
bower install
```

Architecture
==============

![Architecture](https://raw.githubusercontent.com/guillermocorrea/nodejs-restful/master/doc/img/nodesj-restful.gif) 

Example token request:
```
POST http://localhost:8080/oauth/token HTTP/1.1
Host: localhost:8080
Accept-Encoding: gzip, deflate, compress
Accept: application/json
Content-Type: application/json; charset=utf-8
User-Agent: HTTPie/0.8.0
Content-Length: 133

{"grant_type": "password", "client_id": "mobileV1", "client_secret": "abc123456", "username": "andrey", "password": "simplepassword"}
```
