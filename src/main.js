(function(module)
{

    'use strict';

    var util = require('util');
    var url = require('url');
    var EventEmitter = require('events').EventEmitter;

    var Crawler = require('./crawler.js');
    var PSI = require('./psi.js');

    var m = function(params, module_callback)
    {

        EventEmitter.call(this);
        var baseurl = false;
        if (typeof params.baseurl !== 'undefined')
        {
            baseurl = url.parse(params.baseurl.search(/https?:\/\//) !== -1 ? params.baseurl : 'http://' + params.baseurl);
        }

        /**
         * Starts the main process
         */
        this.start = function()
        {
            if (baseurl === false)
            {
                module_callback(baseurl, []);
                return;
            }
            var crawler = new Crawler(baseurl);
            crawler.on('fetch', _onCrawledURL.bind(this));
            crawler.on('complete', _onCrawlerComplete.bind(this));
            crawler.crawl();
        };

        /**
         * Fetched an URL with the crawler
         * @param error
         * @param url
         * @private
         */
        var _onCrawledURL = function(error, url)
        {
            this.emit('fetch_url', error, url);
        };

        /**
         * Crawling complete, starts getting PSI data
         * @param urls
         */
        var _onCrawlerComplete = function(urls)
        {
            if (urls.length === 0)
            {
                module_callback(baseurl, []);
                return;
            }
            var psi = new PSI(baseurl, urls);
            psi.on('fetch', _onGotPSIResult.bind(this));
            psi.on('complete', _onGotPSIResults);
            psi.crawl();
        };

        /**
         * Got the PSI data for one URL
         * @param error
         * @param url
         * @param strategy
         */
        var _onGotPSIResult = function(error, url, strategy)
        {
            this.emit('fetch_psi', error, url, strategy);
        };

        /**
         * Sends the result back when all PSI results have been fetched
         * @param results
         */
        var _onGotPSIResults = function(results)
        {
            module_callback(baseurl.href, results);
        };

    };
    util.inherits(m, EventEmitter);

    module.exports = m;

})(module);