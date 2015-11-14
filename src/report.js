(function(module, cwd)
{

    'use strict';

    var fs = require('fs');
    var os = require('os');
    var filesize = require('file-size');

    var m = function(results)
    {

        var html_report = fs.readFileSync(cwd + '/templates/report.html', {encoding: 'utf8'});
        var html_item = fs.readFileSync(cwd + '/templates/item.html', {encoding: 'utf8'});

        this.build = function(callback)
        {
            for (var index = 0; index < results.length; index += 1)
            {
                html_report = html_report.replace('<!--results-->', _buildItem(results[index]) + '<!--results-->');
            }
            var report_path = os.tmpdir().replace(/\/$/, '') + '/report_' + new Date().getTime() + '.html';
            fs.writeFileSync(report_path, html_report, {encoding: 'utf8'});
            callback(report_path);
        };

        var _buildItem = function(result)
        {
            var placeholders = {
                url: result.id,
                title: result.title,
                strategy: '@todo',
                speed_score: result.ruleGroups.SPEED.score,
                speed_class: result.ruleGroups.SPEED.score >= 50 ? (result.ruleGroups.SPEED.score >= 90 ? 'green' : 'orange') : 'red',
                usability_score: result.ruleGroups.USABILITY.score,
                usability_class: result.ruleGroups.USABILITY.score >= 50 ? (result.ruleGroups.USABILITY.score >= 90 ? 'green' : 'orange') : 'red',
                html_size: filesize(parseInt(result.pageStats.htmlResponseBytes)).human(),
                css_size: filesize(parseInt(result.pageStats.cssResponseBytes)).human(),
                js_size: filesize(parseInt(result.pageStats.javascriptResponseBytes)).human(),
                img_size: filesize(parseInt(result.pageStats.imageResponseBytes)).human(),
                request_size: filesize(parseInt(result.pageStats.totalRequestBytes)).human(),
                total_resources: result.pageStats.numberResources,
                css_resources: result.pageStats.numberCssResources,
                js_resources: result.pageStats.numberJsResources
            };
            var html = html_item;
            for (var placeholder in placeholders)
            {
                html = html.replace('{{' + placeholder + '}}', placeholders[placeholder]);
            }
            return html;
        };
    };

    module.exports = m;

})(module, __dirname);