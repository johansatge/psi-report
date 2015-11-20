(function(module)
{

    'use strict';

    var colors = require('colors');
    var Crawler = require('simplecrawler');

    var m = function(baseurl)
    {
        var urls = [];
        var crawler = null;
        var callback = null;

        this.crawl = function(func)
        {
            callback = func;

            crawler = new Crawler(baseurl.host, baseurl.path, baseurl.port !== null ? baseurl.port : 80);
            crawler.initialProtocol = baseurl.protocol.replace(/:$/, '');
            crawler.supportedMimeTypes = [/text\/html/, /application\/xhtml\+xml/];
            crawler.downloadUnsupported = false;

            crawler.addFetchCondition(_filterFetchCondition);
            crawler.on('fetchcomplete', _onCrawlerItemComplete);
            crawler.on('fetcherror', _onCrawlerItemError);
            crawler.on('complete', _onCrawlerComplete);

            console.log('Crawling ' + colors.underline(baseurl.href));
            crawler.start(); // @todo handle errors
        };

        function _onCrawlerItemComplete(item)
        {
            var mime_types = /(text\/html|application\/xhtml\+xml)/;
            if (item.stateData.contentType && item.stateData.contentType.search(mime_types) !== -1)
            {
                if (item.url.search(baseurl.href) === 0)
                {
                    var readable_url = item.url.replace(baseurl.href, '');
                    console.log('Found ' + colors.underline(readable_url.length > 0 ? readable_url : '/'));
                    urls.push(item.url);
                }
            }
        }

        function _onCrawlerItemError(item)
        {
            console.log(colors.yellow('Error when fetching ' + item.url));
        }

        function _filterFetchCondition(url)
        {
            return !url.path.match(/\.(css|js|png|jpe?g|gif|ico)$/i) && url.path.search(baseurl.path) === 0;
        }

        function _onCrawlerComplete()
        {
            callback(urls);
        }
    };

    module.exports = m;

})(module);