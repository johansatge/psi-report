(function(module, cwd)
{

    'use strict';

    var fs = require('fs');
    var os = require('os');

    var html_report = fs.readFileSync(cwd + '/templates/report.html', {encoding: 'utf8'});
    var html_item = fs.readFileSync(cwd + '/templates/item.html', {encoding: 'utf8'});

    /**
     * Builds a HTML report
     * @param url
     * @param data
     */
    var m = function(url, data)
    {
        data.map(function(page)
        {
            html_report = html_report.replace('<!--results-->', _buildItem(page) + '<!--results-->');
        });
        html_report = html_report.replace(new RegExp('{{url}}', 'g'), url);
        return html_report;
    };

    /**
     * Builds an item (an URL and its desktop/mobile data) (see item.html)
     * @param data
     * @returns string
     */
    var _buildItem = function(data)
    {
        var html = html_item;

        html = html.replace(new RegExp('{{url}}', 'g'), data.url);
        html = html.replace(new RegExp('{{encoded_url}}', 'g'), encodeURIComponent(data.url));

        html = html.replace(new RegExp('{{desktop.speed.score}}', 'g'), data.desktop.speed.score);
        html = html.replace(new RegExp('{{desktop.speed.keyword}}', 'g'), data.desktop.speed.keyword);

        html = html.replace(new RegExp('{{mobile.speed.score}}', 'g'), data.mobile.speed.score);
        html = html.replace(new RegExp('{{mobile.speed.keyword}}', 'g'), data.mobile.speed.keyword);
        html = html.replace(new RegExp('{{mobile.usability.score}}', 'g'), data.mobile.usability.score);
        html = html.replace(new RegExp('{{mobile.usability.keyword}}', 'g'), data.mobile.usability.keyword);

        return html.replace(/{{[a-z._]+}}/g, '--');
    };

    module.exports = m;

})(module, __dirname);