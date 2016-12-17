var fs = require('fs-extra');
var async = require('async');
var xml2js = require('xml2js');
var deepmerge = require('deepmerge')

FlowPaperHelpers = function() {
};

FlowPaperHelpers.standardizeUi = function(publicationPath, uiTemplate, retroGameMagsData, callback) {

    //open magazines folder
    fs.readdir(publicationPath, function(err, publications) {
        if (err) {
            return callback(err);
        }

        //loop over all title (game) folders
        async.eachSeries(publications, function(publication, nextpublication) {

            fs.stat(publicationPath + '/' + publication, function(err, stats) {

                //bail if a file
                if (stats.isFile()) {
                    return nextpublication();
                }

                //open each publication folder
                fs.readdir(publicationPath + '/' + publication, function(err, issues) {
                    if (err) {
                        return callback(err);
                    }

                    //loop over all issues
                    async.eachSeries(issues, function(issue, nextissue) {

                        var issuepath = publicationPath + '/' + publication + '/' + issue;

                        fs.stat(issuepath, function(err, stats) {

                            //bail if a file
                            if (stats.isFile()) {
                                return nextissue();
                            }

                            //actual work here :)
                            
                            FlowPaperHelpers.correctUI_Zine(publication, issue, issuepath, uiTemplate, retroGameMagsData, function(err) {
                                if (err) {
                                    console.log(err); //alert but continue
                                }


                                FlowPaperHelpers.correctIndexHtml(publication, issue, issuepath, uiTemplate, retroGameMagsData, function(err) {
                                    if (err) {
                                        console.log(err); //alert but continue
                                    }

                                    return nextissue();
                                });

                            });
                        });

                    }, function(err, result) {
                        if (err) {
                            return callback(err);
                        }
                        return nextpublication();
                    });

                });
            });

        }, function(err, result) {
            if (err) {
                return callback(err);
            }

            return callback();
        });
    });
};

FlowPaperHelpers.correctIndexHtml = function(publication, issue, issuepath, uiTemplate, retroGameMagsData, callback) {

    var xmlPath = issuepath + '/index.html';
    var beforePath = issuepath + '/index_before.json';
    var afterPath = issuepath + '/index_after.json'


    if (retroGameMagsData.publications[publication] && retroGameMagsData.publications[publication].issues[issue]) {
        
        var issueData = retroGameMagsData.publications[publication].issues[issue];

        //since we cant read the html file as xml (I tired) we'll use regex to replace things        

        //open file
        fs.readFile(xmlPath, 'utf8', function(err, contents) {
            if (err) {
                return callback(err);
            }

            var title = issueData.title + ' (' + issueData.month + ' ' + issueData.year + ')';

            //document title
            contents = contents.replace(/<title>(.*)<\/title>/g, '<title>' + title + '</title>');

            //publication title
            contents = contents.replace(/PublicationTitle\s+:.*,/g, 'PublicationTitle: \'' + encodeURIComponent(title) + '\',');

            //google anal
            contents = contents.replace(/TrackingNumber\s+:.*,/g, 'TrackingNumber: \'UA-89018898-1\',');            

            fs.outputFile(xmlPath, contents, function (err) {
                if (err) {
                    return callback(err);
                }
                callback();
            });

        });

    } else {
        callback();
    }

};

FlowPaperHelpers.correctUI_Zine = function(publication, issue, issuepath, uiTemplate, retroGameMagsData, callback) {

    var xmlPath = issuepath + '/UI_Zine.xml';
    var beforePath = issuepath + '/UI_Zine_before.json';
    var afterPath = issuepath + '/UI_Zine_after.json'


    FlowPaperHelpers.readAndParseXml(xmlPath, function(err, json) {
        if (err) {
            return callback(err);
        }

        //save before as json
        fs.ensureFile(beforePath, function(err) {
            fs.outputJson(beforePath, json, function (err) {
                if (err) {
                    return callback(err);
                }
            });
        });


        //merge the template onto the resulting ui file, template overrides
        var mergedJson = deepmerge(json, uiTemplate);

        FlowPaperHelpers.writeTableOfContents(publication, issue, issuepath, retroGameMagsData, mergedJson, function(err, tocJson) {
            if (err) {
                return callback(err);
            }

            //save after as json
            fs.ensureFile(afterPath, function(err) {
                fs.outputJson(afterPath, tocJson, function (err) {
                    if (err) {
                        return callback(err);
                    }
                });
            });

            //rebuild file
            FlowPaperHelpers.writeXml(xmlPath, tocJson, function(err) {
                if (err) {
                    return callback(err);
                }
                return callback();
            });
        });
    });
};

FlowPaperHelpers.writeTableOfContents = function(publication, issue, issuepath, retroGameMagsData, json, callback) {

    if (retroGameMagsData.publications[publication] && retroGameMagsData.publications[publication].issues[issue] && retroGameMagsData.publications[publication].issues[issue].contents) {

        var contentsData = retroGameMagsData.publications[publication].issues[issue].contents;
        var outline = json.FlowPaper_Zine_UIConfiguration.outline[0].node = [];


        var work = function(object, array) {

            for (key in object) {

                //if value is object
                if (typeof object[key] === 'object') {

                    //create node to put them in
                    var node = FlowPaperHelpers.createTocNode(key);
                    array.push(node);
                    work(object[key], node.node);

                } else {

                    //a page number
                    var node = FlowPaperHelpers.createTocNode(key, object[key]);
                    array.push(node);
                }

            }

            //sort
            array.sort(function(a, b) {

                //where is the page number? if its not on the node, its the first item in the array

                a = a.$.pageNumber || a.node[0].$.pageNumber;
                b = b.$.pageNumber || b.node[0].$.pageNumber;

                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }

                return 0;
            });

        };
        work(contentsData, outline);

        callback(null, json);

    } else {
        return callback(null, json);
    }
};

FlowPaperHelpers.createTocNode = function(title, page) {

    var node = {};
    node.$ = {};

    node.$.title = title;

    if (page) {
        node.$.pageNumber = page;
    }

    node.node = [];

    return node;
};

FlowPaperHelpers.readAndParseXml = function(path, callback) {

    //open file
    fs.readFile(path, function(err, xml) {
        if (err) {
            return callback(err);
        }

        xml2js.parseString(xml, function (err, json) {
            if (err) {
                return callback(err);
            }
            return callback(null, json);
        });
    });
};

FlowPaperHelpers.writeXml = function(path, json, callback) {

    //rebuild file
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(json);

    fs.outputFile(path, xml, function (err) {
        if (err) {
            return callback(err);
        }
        
        return callback();
    });
};

module.exports = FlowPaperHelpers;