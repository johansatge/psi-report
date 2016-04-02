(function(module)
{

    'use strict';

    var util = require('util');
    var async = require('async');
    var request = require('request');
    var EventEmitter = require('events').EventEmitter;

    var m = function(baseurl, urls)
    {
        var results = {};
        var result_count = 0;
        var callback = null;
        EventEmitter.call(this);

        this.crawl = function(func)
        {
            callback = func;
            var psi_queue = async.queue(_getPSIData.bind(this), 3);
            psi_queue.drain = _onPSIQueueDone.bind(this);
            for (var index = 0; index < urls.length; index += 1)
            {
                psi_queue.push({url: urls[index], strategy: 'mobile'});
                psi_queue.push({url: urls[index], strategy: 'desktop'});
            }
        };

        var _getPSIData = function(task, done)
        {
            var api_url = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?strategy=$1&url=$2';
            api_url = api_url.replace('$1', task.strategy).replace('$2', encodeURIComponent(task.url));
            var self = this;
            request({url: api_url, json: true}, function(error, response, data)
            {
                if (!error && response.statusCode == 200)
                {
                    self.emit('fetch', null, task.url, task.strategy);
                    if (typeof results[task.url] === 'undefined')
                    {
                        results[task.url] = {url: task.url};
                    }
                    results[task.url][task.strategy] = _parseData(data);
                    result_count += 1;
                }
                else
                {
                    self.emit('fetch', error, task.url, task.strategy);
                }
                done();
            });
        };

        var _onPSIQueueDone = function()
        {
            var data = [];
            for(var url in results)
            {
                data.push(results[url]);
            }
            this.emit('complete', data);
        };

        var _parseData = function(raw_data)
        {
            // Fixes score (sometimes PSI returns 99 without any advices / information)
            for (var group in raw_data.ruleGroups)
            {
                if (typeof raw_data.ruleGroups[group].score === 'undefined' || parseInt(raw_data.ruleGroups[group].score) !== 99)
                {
                    continue;
                }
                var impact = 0;
                for (var index in raw_data.formattedResults.ruleResults)
                {
                    var rule = raw_data.formattedResults.ruleResults[index];
                    if (typeof rule.groups === 'undefined' || rule.groups.indexOf(group) === -1 || typeof rule.ruleImpact === 'undefined')
                    {
                        continue;
                    }
                    impact += rule.ruleImpact;
                }
                raw_data.ruleGroups[group].score = impact !== 0 ? raw_data.ruleGroups[group].score : 100;
            }

            // Gets relevant data
            var data = {
                speed:
                {
                    score: raw_data.ruleGroups.SPEED.score,
                    keyword: raw_data.ruleGroups.SPEED.score >= 50 ? (raw_data.ruleGroups.SPEED.score >= 90 ? 'green' : 'orange') : 'red'
                },
                usability:
                {
                    score: typeof raw_data.ruleGroups.USABILITY !== 'undefined' ? raw_data.ruleGroups.USABILITY.score : false,
                    keyword: typeof raw_data.ruleGroups.USABILITY !== 'undefined' ? (raw_data.ruleGroups.USABILITY.score >= 50 ? (raw_data.ruleGroups.USABILITY.score >= 90 ? 'green' : 'orange') : 'red') : false
                }
            };

            return data;
        };

    };
    util.inherits(m, EventEmitter);

    module.exports = m;

})(module);