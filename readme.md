![Version](https://img.shields.io/npm/v/psi-report.svg)
![Downloads](https://img.shields.io/npm/dm/psi-report.svg)
![Dependencies](https://img.shields.io/david/johansatge/psi-report.svg)
![devDependencies](https://img.shields.io/david/dev/johansatge/psi-report.svg)

# psi-report

Crawls a website or get URLs from a sitemap.xml or a file, gets [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/) data for each page, and exports an HTML report.

![](screenshot.png)

---

* [Installation](#installation)
* [CLI usage](#cli-usage)
* [Programmatic usage](#programmatic-usage)
* [Crawler behavior](#crawler-behavior)
* [Changelog](#changelog)
* [License](#license)
* [Credits](#credits)

## Installation

Install with [npm](https://www.npmjs.com/):

```bash
$ npm install psi-report --global
# --global isn't required if you plan to use the node module
```

## CLI usage

```bash
$ psi-report [options] <url> <dest_path>
```

Options:

```bash
    -V, --version               output the version number
    --urls-from-sitemap [name]  Get the list of URLs from sitemap.xml (don't crawl)
    --urls-from-file [name]     Get the list of URLs from a file, one url per line (don't crawl)
    -h, --help                  output usage information
```

Example:

```bash
$ psi-report daringfireball.net/projects/markdown /Users/johan/Desktop/report.html
```

## Programmatic usage

```javascript
// Basic usage

var PSIReport = require('psi-report');
var psi_report = new PSIReport({baseurl: 'http://domain.org'}, onComplete);
psi_report.start();

function onComplete(baseurl, data, html)
{
    console.log('Report for: ' + baseurl);
    console.log(data); // An array of pages with their PSI results
    console.log(html); // The HTML report (as a string)
}

// The "fetch_url" and "fetch_psi" events allow to monitor the crawling process

psi_report.on('fetch_url', onFetchURL);
function onFetchURL(error, url)
{
    console.log((error ? 'Error with URL: ' : 'Fetched URL: ') + url);
}

psi_report.on('fetch_psi', onFetchPSI);
function onFetchPSI(error, url, strategy)
{
    console.log((error ? 'Error with PSI for ' : 'PSI data (' + strategy + ') fetched for ') + url);
}
```

## Crawler behavior

The base URL is used as a root when crawling the pages.

For instance, using the URL `https://daringfireball.net/` will crawl the entire website.

However, `https://daringfireball.net/projects/markdown/` will crawl only:

* `https://daringfireball.net/projects/markdown/`
* `https://daringfireball.net/projects/markdown/basics`
* `https://daringfireball.net/projects/markdown/syntax`
* `https://daringfireball.net/projects/markdown/license`
* And so on

*This may be useful to crawl only one part of a website: everything starting with `/en`, for instance.*

## URLs from a sitemap.xml or a file

Instead of crawling the website, you can set the URL list with a sitemap.xml or a file.

* `--urls-from-sitemap https://example.com/sitemap.xml`
* `--urls-from-file /path/to/urls.txt`

Only the URLs inside this file will be processed.

## Changelog

This project uses [semver](http://semver.org/).

| Version | Date | Notes |
| --- | --- | --- |
| `2.2.1` | 2018-01-19 | Fix missing source files on NPM (@blaryjp)|
| `2.2.0` | 2017-11-27 | Prepend baseurl if not present, for each urls in file (@blaryjp)|
| `2.1.0` | 2017-11-19 | Add `--urls-from-sitemap` and `--urls-from-file` (@blaryjp)|
| `2.0.0` | 2016-04-02 | Deep module rewrite (New module API, updated CLI usage) |
| `1.0.1` | 2016-01-15 | Fix call on obsolete package |
| `1.0.0` | 2015-12-01 | Initial version |

## License

This project is released under the [MIT License](license.md).

## Credits

* [async](https://github.com/caolan/async)
* [colors](https://github.com/Marak/colors.js)
* [request](https://github.com/request/request)
* [crawler](https://github.com/sylvinus/node-crawler)
* [commander](https://github.com/tj/commander.js)
* [sitemapper](https://github.com/hawaiianchimp/sitemapper)
