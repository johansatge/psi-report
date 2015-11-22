(function(module)
{

    'use strict';

    var colors = require('colors');
    var Crawler = require('simplecrawler');
    var EventEmitter = require('events').EventEmitter;

    var m = function(baseurl)
    {

        var emitter = new EventEmitter();
        var urls = [];
        var crawler = null;

        this.on = function(event, callback)
        {
            emitter.on(event, callback);
        };

        this.crawl = function()
        {
            crawler = new Crawler(baseurl.host, baseurl.path, baseurl.port !== null ? baseurl.port : 80);
            crawler.initialProtocol = baseurl.protocol.replace(/:$/, '');
            crawler.supportedMimeTypes = [/text\/html/, /application\/xhtml\+xml/];
            crawler.downloadUnsupported = false;

            crawler.addFetchCondition(_filterFetchCondition);
            crawler.on('fetchcomplete', _onCrawlerItemComplete);
            crawler.on('fetcherror', _onCrawlerItemError);
            crawler.on('complete', _onCrawlerComplete);

            crawler.start(); // @todo handle errors
        };

        function _onCrawlerItemComplete(item)
        {
            var mime_types = /(text\/html|application\/xhtml\+xml)/;
            if (item.stateData.contentType && item.stateData.contentType.search(mime_types) !== -1)
            {
                if (item.url.search(baseurl.href) === 0)
                {
                    urls.push(item.url);
                    emitter.emit('fetched', item.url);
                }
            }
        }

        function _onCrawlerItemError(item)
        {
            emitter.emit('error', item.url);
        }

        function _filterFetchCondition(url)
        {
            return !url.path.match(/\.(css|js|png|jpe?g|gif|ico)$/i) && url.path.search(baseurl.path) === 0;
        }

        function _onCrawlerComplete()
        {
            emitter.emit('complete', urls);
        }
    };

    module.exports = m;

})(module);