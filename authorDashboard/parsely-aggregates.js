var parselyAggregates = (function () {
  var parselyAggregates = {};

  // Uses async.js and jQuery
  // Given an author and a number of day, returns a total of hits for that authors
  // top posts for that day.
  parselyAggregates.authorDaily = function(key, secret, author, days,  handler) {
    author = author.replace('-','%20');
    author = author.replace(' ','%20');

    // Calculate array of dates in YYYY-MM-DD format.
    numberOfDays = days;
    tasks = [];
    var now = moment();
    for (i = 0; i < numberOfDays; i++) {
      day = now.format('YYYY-MM-DD');
      now.subtract('days',1);
      tasks.push(buildAPICall(key, secret, baseUrl, day, author));
    }
    async.parallel(tasks,handler);
  }

  // Returns a function which fits the async.parallel pattern:
  // a function which takes one argument, which is a callback.
  // the return function executes this callback as its final action.
  function buildAPICall(key, secret, baseUrl, date, author) {
    return function(callback) {
      var url = baseUrl + 'analytics/author/' + author + '/detail';
      // MAGIC NUMBER: number of posts to consider for daily totals: 20.
      params = { apikey: key, secret: secret, period_start: date,
                 period_end: date, limit: 20 };
      fullUrl = url + '?' + $.param(params) + '&callback=?';
      $.getJSON(fullUrl, function( data, statusCode) {
        aggregateApiCallback(data, statusCode, date, callback);
      });
    }
  }

  function aggregateApiCallback(data, statusCode, date, callback) {
    if (!data) {
       console.log('AGGREGATE API REQUEST ERROR: no data');
       // TODO handle error
    } else if (statusCode == 'success') {
      // TODO handle OK
      // Sum up _hits from each element
      totalHits = 0;
      for (i in data.data) {
        totalHits += data.data[i]._hits;
      }
      result = {date: date, hits: totalHits};
      callback(null, result)
    } else {
      console.log('AGGREGATE API RESPONSE ERROR ' + statusCode);
    }
  }
 
  return parselyAggregates;
}());
