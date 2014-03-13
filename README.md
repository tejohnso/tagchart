#tagchart

This will fetch html tag count from a url via server-side command line tools using
[Node.js](http://nodejs.org).

A list of the retrieved html tag occurences will be shown in tabular and visual format.

###Installation
Note that the command line tool hxpipe must be available on the server.
It can be found in package html-xml-tools.
```
npm install
node web.js
```

then browse to localhost:3000

###Tests
```
casperjs test tests/
```
The tests will confirm:
- local http connection response
- input field is present
- input field has default focus on page load
- a number of different html tags are found

###Heroku
The local environment requires command hxpipe from package html-xml-tools 
```
heroku config:set BUILDPACK_URL=https://github.com/tejohnso/heroku-buildpack-nodejs.git --app <app_name>
```
