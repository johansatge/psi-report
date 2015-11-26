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

        this.build = function(callback)
        {
            for (var index in results)
            {
                html_report = html_report.replace('<!--results-->', _buildItem(results[index]) + '<!--results-->');
            }
            html_report = html_report.replace(new RegExp('{{url}}', 'g'), url);
            callback(html_report);
        };

        var _buildItem = function(result)
        {
            var html = html_item;
            for (var strategy in result)
            {
                var placeholders = {};

                placeholders.url = result[strategy].id;
                placeholders.encoded_url = encodeURIComponent(result[strategy].id);
                placeholders.title = result[strategy].title;
                placeholders.strategy = strategy;

                if (typeof result[strategy].ruleGroups.SPEED !== 'undefined')
                {
                    placeholders.speed_score = _fixScore(result[strategy].ruleGroups.SPEED.score, result[strategy].formattedResults.ruleResults, 'SPEED');
                    placeholders.speed_class = result[strategy].ruleGroups.SPEED.score >= 50 ? (result[strategy].ruleGroups.SPEED.score >= 90 ? 'green' : 'orange') : 'red';
                }
                else
                {
                    placeholders.speed_score = '?';
                    placeholders.speed_class = '';
                }

                if (typeof result[strategy].ruleGroups.USABILITY !== 'undefined')
                {
                    placeholders.usability_score = _fixScore(result[strategy].ruleGroups.USABILITY.score, result[strategy].formattedResults.ruleResults, 'USABILITY');
                    placeholders.usability_class = result[strategy].ruleGroups.USABILITY.score >= 50 ? (result[strategy].ruleGroups.USABILITY.score >= 90 ? 'green' : 'orange') : 'red';
                }
                else
                {
                    placeholders.usability_score = '?';
                    placeholders.usability_class = '';
                }

                placeholders.html_size = filesize(parseInt(result[strategy].pageStats.htmlResponseBytes)).human();
                placeholders.css_size = filesize(parseInt(result[strategy].pageStats.cssResponseBytes)).human();
                placeholders.js_size = filesize(parseInt(result[strategy].pageStats.javascriptResponseBytes)).human();
                placeholders.img_size = filesize(parseInt(result[strategy].pageStats.imageResponseBytes)).human();
                placeholders.request_size = filesize(parseInt(result[strategy].pageStats.totalRequestBytes)).human();

                placeholders.total_resources = result[strategy].pageStats.numberResources;
                placeholders.css_resources = result[strategy].pageStats.numberCssResources;
                placeholders.js_resources = result[strategy].pageStats.numberJsResources;

                for (var placeholder in placeholders)
                {
                    html = html.replace(new RegExp('{{' + strategy + '.' + placeholder + '}}', 'g'), placeholders[placeholder]);
                }

                var has_rules = false;
                for (var index in result[strategy].formattedResults.ruleResults)
                {
                    var rule = result[strategy].formattedResults.ruleResults[index];
                    if (typeof rule.ruleImpact !== 'undefined' && rule.ruleImpact > 0)
                    {
                        html = html.replace('<!--' + strategy + '.rules-->', _buildRule(rule) + '<!--' + strategy + '.rules-->');
                        has_rules = true;
                    }
                }
                if (!has_rules)
                {
                    html_report.replace('<!--' + strategy + '.rules-->', html_rule.replace('{{title}}', 'Nothing do to'), html_rule.replace('{{text}}', 'All rules are correct.'));
                }
            }
            return html;
        };

        var _fixScore = function(score, rules, group)
        {
            if (parseInt(score) !== 99)
            {
                return score;
            }
            var impact = 0;
            for (var index in rules)
            {
                var rule = rules[index];
                if (typeof rule.groups === 'undefined' || rule.groups.indexOf(group) === -1 || typeof rule.ruleImpact === 'undefined')
                {
                    continue;
                }
                impact += rule.ruleImpact;
            }
            return impact !== 0 ? score : 100;
        };

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