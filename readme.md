![Version](https://img.shields.io/npm/v/psi-report.svg)
![Downloads](https://img.shields.io/npm/dm/psi-report.svg)
![Dependencies](https://img.shields.io/david/johansatge/psi-report.svg)
![devDependencies](https://img.shields.io/david/dev/johansatge/psi-report.svg)

# psi-report

Crawls a website, gets [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/) data for each page, and builds a report in HTML or JSON.

![](screenshot.png)

---

* [Installation](#installation)
* [CLI usage](#cli-usage)
* [Programmatic usage](#programmatic-usage)
* [Crawler behavior](#crawler-behavior)
    * [Crawled URLs](#crawled-urls)
    * [Output formats](#output-formats)
    * [SSL support](#ssl-support)
* [Changelog](#changelog)
* [License](#license)
* [Credits](#credits)

## Installation

Install with [npm](https://www.npmjs.com/):

```bash
npm install -g psi-report
```

## CLI usage

```bash
$ psi-report --help

Crawls a website, gets PageSpeed Insights data for each page, and builds a report in HTML or JSON

Usage:
    psi-report <url>

Example:
    psi-report daringfireball.net/projects/markdown --output=json --open

Options:
    --format                Sets output format: html|json (default is html)
    --save=</my/file.html>  Sets destination file (will save in OS temp dir if empty)
    --stdout                Echoes the result code (html or json) instead of saving it on the disk
    --version               Outputs current version
```

## Programmatic usage

```javascript
var Reporter = require('psi-report');

var reporter = new Reporter({
    baseurl: 'http://domain.org',
    format: 'html'
});

reporter.on('complete', function(error, baseurl, data)
{
    console.log('Report for URL: ' + baseurl);
    if (error)
    {
        console.log('An error occurred: ' + error.message);
    }
    else
    {
        console.log(data); // A JSON object or a HTML string
    }
});

reporter.start();
```

## Crawler behavior

### Crawled URLs

The base URL is used as a root when crawling the pages.

Let's consider those two examples:

```bash
$ psi-report https://daringfireball.net/
```

This will crawl the entire website.

```bash
$ psi-report https://daringfireball.net/projects/markdown/
```

This will restrict the crawler to children pages only:

* `https://daringfireball.net/projects/markdown/` will be crawled
* `https://daringfireball.net/projects/markdown/basics` will be crawled
* `https://daringfireball.net/projects/` will be ignored
* And so on

### Output formats

Two output formats are available.

**html** will output a standalone, human-readable HTML report.

**json** will return a JSON object with the following structure:

```json
{
    "http://domain.org/page1":
    {
        "mobile":
        {
            "...PSI raw data for mobile strategy..."
        },
        "desktop":
        {
            "...PSI raw data for desktop strategy..."
        }
    },
    "http://domain.org/page2":
    {
        "mobile":
        {
            "..."
    }
}
```

[More information about the PSI data format](https://developers.google.com/speed/docs/insights/v2/reference/pagespeedapi/runpagespeed#response).

### SSL support

If you want your website to be crawled with `https://`, specify it when firing the command:

```bash
$ psi-report https://domain.org
```

If no protocol is set, the command will use `http://`.

## Changelog

| Version | Date | Notes |
| --- | --- | --- |
| `1.0.1` | January 15, 2016 | Fix call on obsolete package |
| `1.0.0` | December 01, 2015 | Initial version |

## License

This project is released under the [MIT License](license).

## Credits

* [async](https://github.com/caolan/async)
* [colors](https://github.com/Marak/colors.js)
* [file-size](https://github.com/Nijikokun/file-size)
* [request](https://github.com/request/request)
* [simplecrawler](https://github.com/cgiffard/node-simplecrawler)
* [yargs](https://github.com/bcoe/yargs)
