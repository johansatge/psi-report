#!/usr/bin/env node

(function(process)
{

    'use strict';

    var fs = require('fs');
    var colors = require('colors');
    var argv = require('yargs').argv;

    var PSIReport = require('./main.js');

    var manifest = require('../package.json');

    if (argv.version)
    {
        console.log('psi-report ' + manifest.version);
        process.exit(0);
    }

    if (argv.help || typeof argv._[0] === 'undefined' || typeof argv._[1] === 'undefined')
    {
        var help = [
            '',
            'Crawls a website, gets PageSpeed Insights data for each page, and exports an HTML report',
            '',
            'Usage:',
            '    psi-report <url> <dest_path>',
            '',
            'Example:',
            '    psi-report daringfireball.net/projects/markdown /Users/johan/Desktop/report.html',
            '',
            'Options:',
            '    --help       Outputs help',
            '    --version    Outputs current version'
        ];
        console.log(help.join('\n'));
        process.exit(0);
    }

    var psi_report = new PSIReport({baseurl: argv._[0]}, _onComplete);
    psi_report.on('fetch_url', _onFetchURL);
    psi_report.on('fetch_psi', _onFetchPSI);
    psi_report.start();

    /**
     * Fetched an URL
     * @param error
     * @param url
     */
    function _onFetchURL(error, url)
    {
        url = colors.underline(url);
        console.log(error ? colors.yellow('Fetch error on ' + url + ' (' + error.message + ')') : 'Found ' + url);
    }

    /**
     * Fetched an Insight
     * @param error
     * @param url
     * @param strategy
     */
    function _onFetchPSI(error, url, strategy)
    {
        url = colors.underline(url);
        console.log(error ? colors.yellow('PSI error on ' + url + ' (' + error.message + ')') : 'Got PSI data (' + strategy + ') for ' + url);
    }

    /**
     * Builds the HTML document when crawling is done
     * @param baseurl
     * @param data
     * @param html
     */
    function _onComplete(baseurl, data, html)
    {
        if (data.length === 0)
        {
            console.log(colors.red('No pages found'));
            process.exit(1);
        }
        var path = argv._[1];
        if (!path.match(/\.html?$/))
        {
            path += '.html';
        }
        fs.writeFile(path, html, {encoding: 'utf8'}, function(error)
        {
            console.log(error ? colors.red('Write error (' + error.message + ')') : colors.green('Report saved'));
            process.exit(error ? 1 : 0);
        });
    }

})(process);
