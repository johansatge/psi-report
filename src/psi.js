(function(module, process)
{

    'use strict';

    var crypto = require('crypto');
    var psi = require('psi');
    var async = require('async');
    var colors = require('colors');
    var EventEmitter = require('events').EventEmitter;

    var m = function(baseurl, urls)
    {
        var emitter = new EventEmitter();
        var results = [];
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
                    var id = crypto.createHash('md5').update(task.url).digest('hex');
                    emitter.emit('fetched', task.url, task.strategy);
                    if (typeof results[id] === 'undefined')
                    {
                        results[id] = {};
                    }
                    results[id][task.strategy] = data;
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
            emitter.emit('complete', results);
        };

    };

    module.exports = m;

})(module, process);