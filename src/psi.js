(function(module)
{

    'use strict';

    var crypto = require('crypto');
    var psi = require('psi');
    var async = require('async');
    var EventEmitter = require('events').EventEmitter;

    var m = function(baseurl, urls)
    {
        var emitter = new EventEmitter();
        var results = {};
        var result_count = 0;
        var callback = null;

        this.on = function(event, callback)
        {
            emitter.on(event, callback);
        };

        this.crawl = function(func)
        {
            callback = func;
            var psi_queue = async.queue(_getPSIData, 3);
            psi_queue.drain = _onPSIQueueDone;
            for (var index = 0; index < urls.length; index += 1)
            {
                psi_queue.push({url: urls[index], strategy: 'mobile'});
                psi_queue.push({url: urls[index], strategy: 'desktop'});
            }
        };

        var _getPSIData = function(task, done)
        {
            psi(task.url, {strategy: task.strategy}).then(function(data)
            {
                if (data.responseCode == 200)
                {
                    emitter.emit('fetched', task.url, task.strategy);
                    if (typeof results[task.url] === 'undefined')
                    {
                        results[task.url] = {};
                    }
                    results[task.url][task.strategy] = data;
                    result_count += 1;
                }
                done();
            }).catch(function(error)
            {
                emitter.emit('error', task.url, error);
                done();
            });
        };

        var _onPSIQueueDone = function()
        {
            emitter.emit('complete', results, result_count);
        };

    };

    module.exports = m;

})(module);