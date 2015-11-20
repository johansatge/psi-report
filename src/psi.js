(function(module, process)
{

    'use strict';

    var psi = require('psi');
    var async = require('async');
    var colors = require('colors');

    var m = function(baseurl, urls)
    {
        var results = [];
        var callback = null;

        this.crawl = function(func)
        {
            callback = func;
            var psi_queue = async.queue(_getPSIData, 5);
            psi_queue.drain = _onPSIQueueDone;
            for (var index = 0; index < urls.length; index += 1)
            {
                psi_queue.push({url: urls[index]});
            }
        };

        var _getPSIData = function(task, done)
        {
            psi(task.url, {strategy: 'mobile'}).then(function(data) // @todo also get desktop
            {
                if (data.responseCode == 200)
                {
                    var readable_url = task.url.replace(baseurl.href, '');
                    console.log('Got Insights for ' + colors.underline(readable_url.length > 0 ? readable_url : '/'));
                    results.push(data);
                }
                done();
            }).catch(function(error)
            {
                console.log(colors.red(error.message));
                process.exit();
            });
        };

        var _onPSIQueueDone = function()
        {
            callback(results);
        };

    };

    module.exports = m;

})(module, process);