/**
 * Get 3 months worth of data
 * Make 3 async requests.
 * Create a promise that handles the callback when all three finish returning
 */

(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "web_url", alias: "web_url", dataType: tableau.dataTypeEnum.string },
            { id: "source", alias: "source", dataType: tableau.dataTypeEnum.string },
            { id: "word_count", alias: "word_count", dataType: tableau.dataTypeEnum.string },
            { id: "headline", alias: "headline", dataType: tableau.dataTypeEnum.string },
            { id: "pub_date", alias: "pub_date", dataType: tableau.dataTypeEnum.string },
            { id: "section_name", alias: "section_name", dataType: tableau.dataTypeEnum.string },
            { id: "subsection_name", alias: "subsection_name", dataType: tableau.dataTypeEnum.string },
            { id: "news_desk", alias: "news_desk", dataType: tableau.dataTypeEnum.string },
            { id: "keywords_rank", alias: "keywords_rank", dataType: tableau.dataTypeEnum.string },
            { id: "keywords_name", alias: "keywords_name", dataType: tableau.dataTypeEnum.string },
            { id: "keywords_value", alias: "keywords_value", dataType: tableau.dataTypeEnum.string },
            { id: "type_of_material", alias: "type_of_material", dataType: tableau.dataTypeEnum.string }
        ];

        var tableInfo = {
            id: "archiveAPI",
            alias: "NYT Archive API",
            columns: cols
        };

        schemaCallback([tableInfo]);
    };

    var make_url = function (year, month) {
        var url = "https://api.nytimes.com/svc/archive/v1/";
        url += year + '/' + month + '.json';
        url += '?' + $.param({
            'api-key': "772925f7d490445fa8a6b1be09ec262a"
        });
        return url;
    }

    var make_api_request = function (url) {
        console.log("make_api_request called with: " + url);
        var data = Promise.resolve($.getJSON(url));
        return data;
    };

    myConnector.getData = function (table, doneCallback) {
        var urls = [1,2].map(function (x) {
            return make_url(1986, x);
        });


        var api_response_promises = urls.map(make_api_request);

        Promise.all(api_response_promises).then(function (responses) {
            // Create a single array of all responses.
            var articles = responses.reduce(function(acc, cur_val) {
                return acc.concat(cur_val.response.docs);
            }, []);

            var tableData = [];

            // Iterate over the JSON object
            for (var i = 0, len = articles.length; i < len; i++) {
                tableData.push({
                    "web_url": articles[i].web_url,
                    "source": articles[i].source,
                    "word_count": articles[i].word_count,
                    "headline": articles[i].headline.main,
                    "pub_date": articles[i].pub_date,
                    "section_name": articles[i].section_name,
                    "subsection_name": articles[i].subsection_name,
                    "news_desk": articles[i].news_desk,
                    "keywords_rank": articles[i].keywords.rank,
                    "keywords_name": articles[i].keywords.name,
                    "keywords_value": articles[i].keywords.value,
                    "type_of_material": articles[i].type_of_material

                });
            }

            table.appendRows(tableData);
            doneCallback();
        });


    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "NYT Archive API";
            tableau.submit();
        });
    });
})();
