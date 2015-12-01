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
        var html_rule = fs.readFileSync(cwd + '/templates/rule.html', {encoding: 'utf8'});

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

                // Adds rules if needed (like "Leverage browser caching")
                var has_rules = false;
                var rule_results = result[strategy].formattedResults.ruleResults;
                for (var index in rule_results)
                {
                    if (typeof rule_results[index].ruleImpact !== 'undefined' && rule_results[index].ruleImpact > 0)
                    {
                        html = html.replace('<!--' + strategy + '.rules-->', _buildRule(rule_results[index]) + '<!--' + strategy + '.rules-->');
                        has_rules = true;
                    }
                }
                if (!has_rules)
                {
                    var no_rules = html_rule.replace('{{title}}', 'Nothing do to').replace('{{text}}', 'All rules are correct.');
                    html = html.replace('<!--' + strategy + '.rules-->', no_rules);
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
            var stats = result.pageStats;

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

            placeholders.html_size = typeof stats.htmlResponseBytes !== 'undefined' ? filesize(parseInt(stats.htmlResponseBytes)).human() : 0;
            placeholders.css_size = typeof stats.cssResponseBytes !== 'undefined' ? filesize(parseInt(stats.cssResponseBytes)).human() : 0;
            placeholders.js_size = typeof stats.javascriptResponseBytes !== 'undefined' ? filesize(parseInt(stats.javascriptResponseBytes)).human() : 0;
            placeholders.img_size = typeof stats.imageResponseBytes !== 'undefined' ? filesize(parseInt(stats.imageResponseBytes)).human() : 0;
            placeholders.request_size = typeof stats.imageResponseBytes !== 'undefined' ? filesize(parseInt(stats.totalRequestBytes)).human() : 0;
            placeholders.total_resources = typeof stats.numberResources !== 'undefined' ? stats.numberResources : 0;
            placeholders.css_resources = typeof stats.numberCssResources !== 'undefined' ? stats.numberCssResources : 0;
            placeholders.js_resources = typeof stats.numberJsResources !== 'undefined' ? stats.numberJsResources : 0;

            return placeholders;
        };

        /**
         * Builds a rule (a tip given by PSI, like "Leverage browser caching", "Eliminate render-blocking JavaScript and CSS in above-the-fold content"
         * A rule is made of a text and placeholders (links to Google documentation, file counts, etc)
         * See rule.html
         * @param rule
         * @returns string
         */
        var _buildRule = function(rule)
        {
            var html = html_rule.replace('{{title}}', rule.localizedRuleName);
            var text = typeof rule.summary !== 'undefined' ? rule.summary.format : rule.localizedRuleName;
            if (typeof rule.summary !== 'undefined' && typeof rule.summary.args !== 'undefined')
            {
                for (var index = 0; index < rule.summary.args.length; index += 1)
                {
                    var arg = rule.summary.args[index];
                    if (arg.type !== 'HYPERLINK')
                    {
                        text = text.replace('{{' + arg.key + '}}', arg.value);
                    }
                    else
                    {
                        text = text.replace('{{BEGIN_' + arg.key + '}}', '<a href="' + arg.value + '" target="_blank">');
                        text = text.replace('{{END_' + arg.key + '}}', '</a>');
                    }
                }
            }

            html = html.replace('{{text}}', text);
            return html;
        }
    };

    module.exports = m;

})(module, __dirname);