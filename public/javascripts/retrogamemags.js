var retroGameMags = (function() {

    var _tooltips = function($) {
        //apply tooltips
        $('.tooltip').tooltipster({
            theme: 'tooltipster-shadow',
            contentAsHTML: true,
            animation: 'grow'
        });
    };

    var _stockShelves = function($, target, publications) {

        //for each publication and each issue
        for (publication in publications) {
            for (issue in publications[publication].issues) {
                
                //for every fifth, create a new shelf
                var i = parseInt(issue, 10);
                if (i % 5 === 1) {

                    var shelf = $('<div class="shelf"><ul></ul></div>');

                    //on the shelf, for the next 5 magazines, build a template and append them
                    for (var j = i; j < (i + 5); ++j) {
                        
                        if (publications[publication].issues[j]) {
                            var issueData = publications[publication].issues[j];
                            $(shelf).find('ul').append(_buildMagazineTemplate(publication, j, issueData));
                        }
                    }

                    $(target).append(shelf);
                }
            }
        }


    };

    var _buildMagazineTemplate = function(publication, issue, issueData) {

        var pathToIssue = 'https://dl.dropboxusercontent.com/u/1433808/retrogamemags/' + publication + '/' + issue;

        var li = $('<li class="shelf-magazine tooltip" title="#' + issue + ' ' + issueData.month + ' ' + issueData.year + '">');
        var a = $('<a href="' + pathToIssue + '/index.html" target="_blank"></a>');
        var img = $('<img src="' + pathToIssue + '/docs/' + publication + '_' + issue + '.pdf_1_thumb.jpg" />');
        $(a).append(img);
        $(li).append(a);
        return li;
    };

    var _compress = {
        /**
         * compress and base64 encode a uint8array
         * @param  {UInt8Array} uint8array
         * @return {string}
         */
        bytearray: function(uint8array) {
            var deflated = pako.deflate(uint8array, {to: 'string'});
            return btoa(deflated);
        },
        /**
         * comrpess and base64 encode a json object
         * @param  {Object} json
         * @return {string}
         */
        json: function(json) {
            var string = JSON.stringify(json);
            var deflate = pako.deflate(string, {to: 'string'});
            var base64 = btoa(deflate);
            return base64;
        },
        /**
         * compress and base64 encode a string
         * @param  {string} string
         * @return {string}
         */
        string: function(string) {
            var deflate = pako.deflate(string, {to: 'string'});
            var base64 = btoa(deflate);
            return base64;
        }
    };

    var _decompress = {
        /**
         * decompress and base64 decode a string to uint8array
         * @param  {string} item
         * @return {UInt8Array}
         */
        bytearray: function(item) {
            var decoded = new Uint8Array(atob(item).split('').map(function(c) {return c.charCodeAt(0);}));
            return pako.inflate(decoded);
        },
        /**
         * decompress and base64 decode a string to json
         * @param  {string} item
         * @return {Object}
         */
        json: function(item) {
            var base64 = atob(item);
            var inflate = pako.inflate(base64, {to: 'string'});
            var json = JSON.parse(inflate);
            return json;
        },
        /**
         * decompress a string
         * @param  {string} item
         * @return {string}
         */
        string: function(item) {
            var base64 = atob(item);
            var inflate = pako.inflate(base64, {to: 'string'});
            return inflate;
        }
    };

    return {
        main: function($) {

            $(document).ready(function() {
                
                //prepare date slider
                $('#slider').dateRangeSlider({
                    bounds: {
                        min: new Date(1988, 0, 1),
                        max: new Date(2000, 11, 31)
                    },
                    range:{
                        min: { months: 1},
                        max: { months: 12}
                    },
                    step:{
                        months: 1
                    },
                    defaultValues:{
                        min: new Date(1989, 0, 1),
                        max: new Date(1989, 1, 1)
                    },
                    valueLabels:"change",
                    delayOut: 4000,
                    symmetricPositionning: true,
                    formatter:function(val) {
                        return $.format.date(val, "MMM yyyy")
                    }
                }).bind('valuesChanged', function(e, data){

                    $.get('/bydate?min=' + data.values.min + '&max=' + data.values.max, function(results) {

                        console.log(results);
                    });
                });

                //prepare stock
                if (publications) {
                    publications = _decompress.json(publications);
                    _stockShelves($, $('#bookshelf'), publications);
                }


                _tooltips($);
            });
        }
    };

}());

retroGameMags.main(jQuery);