(function(module)
{

    'use strict';

    var fs = require('fs');
    var url = require('url');
    var Crawler = require('./crawler.js');
    var PSI = require('./psi.js');
    var Report = require('./report.js');
    var EventEmitter = require('events').EventEmitter;

    var m = function(params)
    {

        var emitter = new EventEmitter();
        var format = typeof params.format !== 'undefined' ? params.format : 'html';
        var output = typeof params.output !== 'undefined' ? params.output : false;
        var baseurl = false;
        if (typeof params.baseurl !== 'undefined')
        {
            baseurl = url.parse(params.baseurl.search(/https?:\/\//) !== -1 ? params.baseurl : 'http://' + params.baseurl);
        }

        this.on = function(event, callback)
        {
            emitter.on(event, callback);
        };

        this.start = function()
        {
            if (baseurl === false)
            {
                emitter.emit('complete', new Error('Please provide a valid URL'), baseurl, null);
                return;
            }
            var crawler = new Crawler(baseurl);
            crawler.on('fetched', function(url)
            {
                emitter.emit('crawler_url_fetched', url);
            });
            crawler.on('error', function(url)
            {
                emitter.emit('crawler_url_error', url);
            });
            crawler.on('complete', _onCrawled);
            crawler.crawl();
            emitter.emit('start', baseurl);
        };

        var _onCrawled = function(urls)
        {
            if (urls.length === 0)
            {
                emitter.emit('complete', new Error('No URLS found'), baseurl, null);
                return;
            }
            var psi = new PSI(baseurl, urls);
            psi.on('fetched', function(url, strategy)
            {
                emitter.emit('psi_url_fetched', url, strategy);
            });
            psi.on('error', function(error)
            {
                emitter.emit('psi_url_error', url, error);
            });
            psi.on('complete', _onGotPSIResults);
            psi.crawl();
        };

        var _onGotPSIResults = function(results, count)
        {
            if (count === 0)
            {
                emitter.emit('complete', new Error('No PSI results found'), baseurl, null);
                return;
            }
            if (format === 'json')
            {
                _onBuiltResult(JSON.stringify(results, null, 2));
            }
            else
            {
                var report = new Report(baseurl.href, results);
                report.build(_onBuiltResult);
            }
        };

        var _onBuiltResult = function(result)
        {
            if (output !== false)
            {
                fs.writeFile(output, result, {encoding: 'utf8'}, function(error)
                {
                    emitter.emit('error', error, baseurl, result);
                });
            }
            else
            {
                emitter.emit('complete', null, baseurl, result);
            }
        };

    };

    module.exports = m;

})(module);