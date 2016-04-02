(function(module)
{

    'use strict';

    var util = require('util');
    var async = require('async');
    var request = require('request');
    var EventEmitter = require('events').EventEmitter;

    var api_url = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?strategy=$1&url=$2';

    var m = function(baseurl, urls, module_callback)
    {
        var results = {};
        EventEmitter.call(this);

        /**
         * Starts crawling (makes 2 requests per URL, for mobile and desktop strategies)
         * Runs only 3 concurrent tasks (using more may result in hitting the API rate limit)
         */
        this.crawl = function()
        {
            var psi_queue = async.queue(_getPSIData.bind(this), 3);
            psi_queue.drain = _onPSIQueueDone.bind(this);
            for (var index = 0; index < urls.length; index += 1)
            {
                psi_queue.push({url: urls[index], strategy: 'mobile'});
                psi_queue.push({url: urls[index], strategy: 'desktop'});
            }
        };

        /**
         * Fires the Google API and parses the result
         * @param task
         * @param callback
         */
        var _getPSIData = function(task, callback)
        {
            var url = api_url.replace('$1', task.strategy).replace('$2', encodeURIComponent(task.url));
            var self = this;
            request({url: url, json: true}, function(error, response, data)
            {
                if (error || response.statusCode !== 200)
                {
                    self.emit('fetch', error ? error : new Error('HTTP error ' + response.statusCode), task.url, task.strategy);
                    return;
                }
                if (typeof results[task.url] === 'undefined')
                {
                    results[task.url] = {url: task.url};
                }
                results[task.url][task.strategy] = _parseData(data);
                self.emit('fetch', null, task.url, task.strategy);
                callback();
            });
        };

        /**
         * Returns the results as an array (mobile and desktop scores, for each page)
         */
        var _onPSIQueueDone = function()
        {
            var array = [];
            for (var url in results)
            {
                array.push(results[url]);
            }
            module_callback(array);
        };

        /**
         * Parses PSI data
         * @param raw_data
         * @return object
         */
        var _parseData = function(raw_data)
        {
            var rule_groups = raw_data.ruleGroups;

            // Fixes score calculation (on some cases - which ones ? - PSI returns 99 but no advices or information)
            // https://groups.google.com/forum/#!topic/pagespeed-insights-discuss/qqQOyntLzec
            for (var group in rule_groups)
            {
                if (typeof rule_groups[group].score === 'undefined' || parseInt(rule_groups[group].score) !== 99)
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
                rule_groups[group].score = impact !== 0 ? rule_groups[group].score : 100;
            }

            // Returns relevant data only
            return {
                speed: {
                    score: rule_groups['SPEED'].score,
                    keyword: rule_groups['SPEED'].score >= 50 ? (rule_groups['SPEED'].score >= 90 ? 'green' : 'orange') : 'red'
                },
                usability: {
                    score: typeof rule_groups['USABILITY'] !== 'undefined' ? rule_groups['USABILITY'].score : false,
                    keyword: typeof rule_groups['USABILITY'] !== 'undefined' ? (rule_groups['USABILITY'].score >= 50 ? (rule_groups['USABILITY'].score >= 90 ? 'green' : 'orange') : 'red') : false
                }
            };
        };

    };
    util.inherits(m, EventEmitter);

    module.exports = m;

})(module);