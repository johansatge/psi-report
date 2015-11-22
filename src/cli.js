#!/usr/bin/env node

(function(process)
{

    'use strict';

    var exec = require('child_process').exec;
    var fs = require('fs');
    var os = require('os');
    var colors = require('colors');
    var argv = require('yargs').argv;

    var Reporter = require('./core.js');

    var manifest = require('../package.json');

    if (argv.version)
    {
        console.log('psi-report ' + manifest.version);
        process.exit(0);
    }

    var format = typeof argv.format !== 'undefined' && argv.format === 'json' ? 'json' : 'html';
    var reporter = new Reporter({
        baseurl: argv._[0],
        format: format
    });

    reporter.on('_start', function(baseurl)
    {
        _verbose('Crawling URLS, starting from ' + colors.underline(baseurl));
    });
    reporter.on('_crawler_url_fetched', function(url)
    {
        _verbose('Found ' + colors.underline(url));
    });
    reporter.on('_crawler_url_error', function(url)
    {
        _verbose(colors.yellow('Error when fetching ' + colors.underline(url)));
    });
    reporter.on('_psi_url_fetched', function(url, strategy)
    {
        _verbose('Got Insights (' + strategy + ') for ' + colors.underline(url));
    });
    reporter.on('_psi_url_error', function(url, error)
    {
        _verbose(colors.yellow('PSI error on ' + colors.underline(url) + ' (' + error.message + ')'));
    });
    reporter.on('complete', function(error, baseurl, data)
    {
        if (error)
        {
            console.log(colors.red(error.message));
            process.exit(1);
        }
        if (argv.stdout)
        {
            console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
            process.exit(0);
        }
        var path = typeof argv.save !== 'undefined' ? argv.save : os.tmpdir().replace(/\/$/, '') + '/psi_report_' + new Date().getTime() + '.' + format;
        try
        {
            fs.writeFileSync(path, data, {encoding: 'utf8'});
            _verbose(colors.green('Report saved ') + '(' + colors.underline(path) + ')');
            if (typeof argv.open !== 'undefined')
            {
                exec('open ' + path);
            }
            process.exit(0);
        }
        catch (error)
        {
            console.log(colors.red(error.message));
            process.exit(1);
        }
    });

    reporter.start();

    function _verbose(message)
    {
        if (!argv.stdout)
        {
            console.log(message);
        }
    }

})(process);
