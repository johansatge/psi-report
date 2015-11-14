(function(module)
{

    'use strict';

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
            crawler.on('complete', _onCrawlerComplete);

            crawler.start();
        };

        function _onCrawlerItemComplete(item)
        {
            var mime_types = /(text\/html|application\/xhtml\+xml)/;
            if (item.stateData.contentType && item.stateData.contentType.search(mime_types) !== -1)
            {
                if (item.url.search(baseurl.href) === 0)
                {
                    console.log('Found ' + item.url);
                    urls.push(item.url);
                }
            }
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