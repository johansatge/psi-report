(function(module)
{

    'use strict';

    var util = require('util');
    var jsdom = require('jsdom');
    var Crawler = require('crawler');
    var EventEmitter = require('events').EventEmitter;

    var m = function(baseurl, module_callback)
    {

        EventEmitter.call(this);
        var urls = [];
        var crawler = new Crawler({
            jQuery: jsdom,
            maxConnections: 10,
            callback: _onCrawled.bind(this),
            onDrain: _onAllCrawled.bind(this)
        });

        /**
         * Starts crawling
         */
        this.crawl = function()
        {
            crawler.queue(baseurl.href);
        };

        /**
         * Processes a crawled page
         * If it's an HTML document, checks each <a> and appends new URLs to the crawler queue
         * @param error
         * @param result
         * @param $
         */
        function _onCrawled(error, result, $)
        {
            if (error)
            {
                this.emit('fetch', error, null);
                return;
            }
            if (typeof $ === 'undefined' || urls.indexOf(result.uri) > -1)
            {
                return;
            }
            this.emit('fetch', null, result.uri);
            urls.push(result.uri);
            $('a').map(function(index, a)
            {
                var url = typeof a.href !== 'undefined' ? a.href.replace(/#[^#]*$/, '') : null;
                if (url !== null && urls.indexOf(url) === -1 && _startsWithBaseURL(url))
                {
                    crawler.queue(url);
                }
            });
        }

        /**
         * Returns the list of URLs when crawling is done
         */
        function _onAllCrawled()
        {
            module_callback(urls);
        }

        /**
         * Checks if the given URL begins with the base URL (the one providden to start the crawler)
         * @param url
         * @return bool
         */
        function _startsWithBaseURL(url)
        {
            var base = baseurl.href.replace(/^https?:\/\//, '').replace(/^\/\//, '');
            url = url.replace(/^https?:\/\//, '').replace(/^\/\//, '');
            return url.search(base) === 0;
        }

    };
    util.inherits(m, EventEmitter);

    module.exports = m;

})(module);