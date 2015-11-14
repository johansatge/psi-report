(function(module)
{

    'use strict';

    var psi = require('psi');
    var async = require('async');

    var m = function(urls)
    {
        var results = [];
        var callback = null;

        this.crawl = function(func)
        {
            callback = func;

            var psi_queue = async.queue(_getPSIData, 10);
            psi_queue.drain = _onPSIQueueDone;
            for (var index = 0; index < urls.length; index += 1)
            {
                psi_queue.push({url: urls[index]});
            }
        };

        var _getPSIData = function(task, callback)
        {
            psi(task.url, {strategy: 'mobile'}).then(function(data)
            {
                if (data.responseCode == 200)
                {
                    console.log('Got PSI data for ' + task.url);
                    results.push(data);
                }
                callback();
            });
        };

        var _onPSIQueueDone = function()
        {
            callback(results);
        };

    };

    module.exports = m;

})(module);