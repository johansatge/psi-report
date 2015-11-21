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

        this.build = function(callback)
        {
            console.log('Building report...');
            for (var index in results)
            {
                html_report = html_report.replace('<!--results-->', _buildItem(results[index]) + '<!--results-->');
            }
            html_report = html_report.replace(new RegExp('{{url}}', 'g'), url);
            var report_path = os.tmpdir().replace(/\/$/, '') + '/report_' + new Date().getTime() + '.html';
            fs.writeFileSync(report_path, html_report, {encoding: 'utf8'});
            callback(report_path);
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
                    placeholders.speed_score = result[strategy].ruleGroups.SPEED.score;
                    placeholders.speed_class = result[strategy].ruleGroups.SPEED.score >= 50 ? (result[strategy].ruleGroups.SPEED.score >= 90 ? 'green' : 'orange') : 'red';
                }
                else
                {
                    placeholders.speed_score = '?';
                    placeholders.speed_class = '';
                }

                if (typeof result[strategy].ruleGroups.USABILITY !== 'undefined')
                {
                    placeholders.usability_score = result[strategy].ruleGroups.USABILITY.score;
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
            }
            return html;
        };
    };

    module.exports = m;

})(module, __dirname);