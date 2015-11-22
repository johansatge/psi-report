#!/usr/bin/env node

(function(process)
{

    'use strict';

    var colors = require('colors');
    var argv = require('yargs').argv;

    var Reporter = require('./core.js');

    var manifest = require('../package.json');

    if (argv.version)
    {
        console.log('psi-report ' + manifest.version);
        process.exit(0);
    }

    var reporter = new Reporter({
        baseurl: argv._[0],
        format: typeof argv.format !== 'undefined' && argv.format === 'json' ? 'json' : 'html',
        output: typeof argv.output !== 'undefined' ? argv.output : false
    });

    reporter.on('crawler_start', function(baseurl)
    {
        console.log('Crawling URLS, starting from ' + colors.underline(baseurl.href));
    });
    reporter.on('crawler_url_fetched', function(url)
    {
        console.log('Found ' + colors.underline(url));
    });
    reporter.on('crawler_url_error', function(url)
    {
        console.log(colors.yellow('Error when fetching ' + colors.underline(url)));
    });
    reporter.on('psi_start', function()
    {
        console.log('Getting PSI results...');
    });
    reporter.on('psi_url_fetched', function(url, strategy)
    {
        console.log('Got Insights (' + strategy + ') for ' + colors.underline(url));
    });
    reporter.on('psi_url_error', function(url, error)
    {
        console.log(colors.yellow('PSI error on ' + colors.underline(url) + ' (' + error.message + ')'));
    });
    reporter.on('complete', function(error, baseurl, data)
    {
        if (error)
        {
            console.log(colors.red(error.message));
            process.exit(1);
        }
        else
        {
            console.log(baseurl);
            console.log(data);
            process.exit(0);
        }
    });

    reporter.start();

})(process);
