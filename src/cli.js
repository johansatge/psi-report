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
        format: typeof argv.format !== 'undefined' && argv.format === 'json' ? 'json' : 'html'
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
        if (typeof argv.output !== 'undefined')
        {
            try
            {
                fs.writeFileSync(output, data, {encoding: 'utf8'});
                _verbose(colors.green('Done'));
                process.exit(0);
            }
            catch (error)
            {
                console.log(colors.red(error.message));
                process.exit(1);
            }
        }
        else
        {
            _verbose(colors.green('Done'));
            process.exit(0);
        }
    });

    reporter.start();

    function _verbose(message)
    {
        if (argv.verbose)
        {
            console.log(message);
        }
    }

})(process);
