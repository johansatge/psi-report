#!/usr/bin/env node

(function(process)
{

    'use strict';

    var url = require('url');

    var colors = require('colors');
    var argv = require('yargs').argv;
    var psi = require('psi');
    var Crawler = require('simplecrawler');
    var async = require('async');

    if (typeof argv._[0] === 'undefined')
    {
        console.log(colors.red('Please provide a valid base URL'));
        process.exit();
    }

    var baseurl = url.parse(argv._[0].search(/https?:\/\//) !== -1 ? argv._[0] : 'http://' + argv._[0]);

    //
    // Inits PSI queue
    //
    var psi_queue = async.queue(_execPSITask, 10);
    psi_queue.drain = _onPSIQueueDone;
    psi_queue.pause();

    //
    // Inits crawler
    //
    var crawler = new Crawler(baseurl.host, baseurl.path, baseurl.port !== null ? baseurl.port : 80);
    crawler.initialProtocol = baseurl.protocol.replace(/:$/, '');
    crawler.supportedMimeTypes = [/text\/html/, /application\/xhtml\+xml/];
    crawler.downloadUnsupported = false;
    crawler.addFetchCondition(_filterFetchCondition);
    crawler.on('fetchcomplete', _onCrawlerItemComplete);
    crawler.on('complete', _onCrawlerComplete);

    //
    // Starts crawling
    //
    console.log('Crawling ' + colors.yellow(baseurl.href) + '...');
    crawler.start();

    /**
     * Adds crawled items to the PSI queue, if needed
     * @param item
     */
    function _onCrawlerItemComplete(item)
    {
        var mime_types = /(text\/html|application\/xhtml\+xml)/;
        if (item.stateData.contentType && item.stateData.contentType.search(mime_types) !== -1)
        {
            if (item.url.search(baseurl.href) === 0)
            {
                console.log('Found ' + item.url);
                psi_queue.push({url: item.url});
            }
        }
    }

    /**
     * Do not crawl assets
     * @param url
     * @return bool
     */
    function _filterFetchCondition(url)
    {
        return !url.path.match(/\.(css|js|png|jpe?g|gif|ico)$/i);
    }

    /**
     * Starts the PSI queue when the crawler has finished its job
     */
    function _onCrawlerComplete()
    {
        var length = psi_queue.length();
        if (length > 0)
        {
            console.log(colors.green('Found ' + length + ' urls'));
            psi_queue.resume();
        }
        else
        {
            console.log(colors.red('Found no urls'));
        }
    }

    /**
     *
     */
    function _onPSIQueueDone()
    {
        console.log('@todo everything done');
    }

    /**
     * Loads PSI score for the given item
     * @param task
     * @param callback
     */
    function _execPSITask(task, callback)
    {
        console.log('@todo PSI for ' + task.url);
        psi(task.url, {strategy: 'mobile'}).then(function(data)
        {
            console.log(data);
            callback();
        });
    }

})(process);
