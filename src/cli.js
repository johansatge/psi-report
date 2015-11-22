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
        process.exit();
    }

    var reporter = new Reporter({
        baseurl: argv._[0],
        format: 'html'
    });

    reporter.on('error', function(error)
    {
        console.log(colors.red(error.message));
        process.exit(1);
    });

    reporter.on('crawler_start', function(url)
    {
        console.log('Getting report...');
    });

    reporter.on('crawler_url_fetched', function(url)
    {
        console.log('Found ' + colors.underline(url));
    });

    reporter.on('crawler_url_error', function(url)
    {
        console.log(colors.yellow('Error when fetching ' + colors.underline(url)));
    });

    reporter.on('crawler_done', function(urls)
    {
        console.log(colors.green('Found ' + urls.length + ' URLS'));
    });

    reporter.on('psi_url_fetched', function(result)
    {

    });

    reporter.start();

})(process);
