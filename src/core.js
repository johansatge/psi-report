(function(module)
{

    'use strict';

    var exec = require('child_process').exec;
    var url = require('url');
    var Crawler = require('./crawler.js');
    var PSI = require('./psi.js');
    var Report = require('./report.js');
    var EventEmitter = require('events').EventEmitter;

    var m = function(params)
    {

        var emitter = new EventEmitter();
        var format = typeof params.format !== 'undefined' ? params.format : 'html';
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
                emitter.emit('error', new Error('Please provide a valid URL'));
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

            emitter.emit('crawler_start', baseurl);
            crawler.crawl();
        };

        var _onCrawled = function(urls)
        {
            emitter.emit('crawler_done', urls); // @todo check how many urls found, if 0, exit
            var psi = new PSI(baseurl, urls);
            psi.crawl(_onGetPSIResults);
        };

        var _onGetPSIResults = function(results)
        {
            var report = new Report(baseurl.href, results);
            report.build(_onBuiltReport);
        };

        var _onBuiltReport = function(path)
        {
            var colors = require('colors');
            console.log(colors.green('Report built.') + ' (' + path + ')');
            var os = require('os');
            if (os.platform() === 'darwin')
            {
                exec('open ' + path);
            }
        };

    };

    module.exports = m;

})(module);