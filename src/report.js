(function(module, cwd)
{

    'use strict';

    var fs = require('fs');
    var os = require('os');
    var filesize = require('file-size');

    var m = function(url, results)
    {

        var html_report = fs.readFileSync(cwd + '/templates/report.html', {encoding: 'utf8'});
        var html_item = fs.readFileSync(cwd + '/templates/item.html', {encoding: 'utf8'});

        /**
         * Builds a HTML report from a list of results (each result being two sets of PSI data, desktop and mobile)
         * @param callback
         */
        this.build = function(callback)
        {
            for (var index in results)
            {
                html_report = html_report.replace('<!--results-->', _buildItem(results[index]) + '<!--results-->');
            }
            html_report = html_report.replace(new RegExp('{{url}}', 'g'), url);
            callback(html_report);
        };

        /**
         * Builds an item (an URL and its desktop/mobile data) (item.html)
         * @param result
         * @returns string
         */
        var _buildItem = function(result)
        {
            var html = html_item;

            for (var strategy in result)
            {
                // Fills placeholders (like {{mobile.html_size}})
                var placeholders = _getPlaceholders(result[strategy], strategy);
                for (var placeholder in placeholders)
                {
                    html = html.replace(new RegExp('{{' + strategy + '.' + placeholder + '}}', 'g'), placeholders[placeholder]);
                }
            }

            return html.replace(/{{[a-z._]+}}/g, '--');
        };

        /**
         * Gets a list of placeholders to be replaced in the HTML template, for the given strategy (like {{html_size}})
         * @param result
         * @param strategy
         * @returns object
         */
        var _getPlaceholders = function(result, strategy)
        {
            var rule_groups = result.ruleGroups;

            var placeholders = {};

            placeholders.url = result.id;
            placeholders.encoded_url = encodeURIComponent(result.id);
            placeholders.title = result.title;
            placeholders.strategy = strategy;

            if (typeof rule_groups.SPEED !== 'undefined')
            {
                placeholders.speed_score = rule_groups.SPEED.score;
                placeholders.speed_class = rule_groups.SPEED.score >= 50 ? (rule_groups.SPEED.score >= 90 ? 'green' : 'orange') : 'red';
            }

            if (typeof rule_groups.USABILITY !== 'undefined')
            {
                placeholders.usability_score = rule_groups.USABILITY.score;
                placeholders.usability_class = rule_groups.USABILITY.score >= 50 ? (rule_groups.USABILITY.score >= 90 ? 'green' : 'orange') : 'red';
            }

            return placeholders;
        };

    };

    module.exports = m;

})(module, __dirname);