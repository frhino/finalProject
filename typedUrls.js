// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Event listner for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.
function onAnchorClick(event) {
    chrome.tabs.create({
      selected: true,
      url: event.srcElement.href
    });
    return false;
  }
  // Given an array of URLs, build a DOM list of those URLs in the
  // browser action popup.
  function buildPopupDom(divName, data) {
    var popupDiv = document.getElementById(divName);
    var ul = document.createElement('ul');
    popupDiv.appendChild(ul);
    for (var i = 0, ie = data.length; i < ie; ++i) {
      var a = document.createElement('a');
      a.href = data[i];
      a.appendChild(document.createTextNode(data[i]));
      a.addEventListener('click', onAnchorClick);
      var li = document.createElement('li');
      li.appendChild(a);
      ul.appendChild(li);
    }
  }
  // Search history to find up to ten links that a user has typed in,
  // and show those links in a popup.
  function buildTypedUrlList(divName) {
    // To look for history items visited in the last week,
    // subtract a week of microseconds from the current time.
    var microsecondsPerMonth = 1000 * 60 * 60 * 24 * 30;
    var oneMonthAgo = (new Date).getTime() - microsecondsPerMonth;
    // Track the number of callbacks from chrome.history.getVisits()
    // that we expect to get.  When it reaches zero, we have all results.
    var numRequestsOutstanding = 0;
    chrome.history.search({
        'text': '',              // Return every history item....
        'startTime': oneMonthAgo,  // that was accessed less than one month ago.
        'maxResults': 5000
      },
      function(historyItems) {
console.log(historyItems);
console.log(moment.duration(historyItems[0].lastVisitTime-historyItems[1].lastVisitTime).asMinutes());
        for (let i = 0; i < historyItems.length-1; i++) {
          let a = [];
          a = Math.ceil((historyItems[i].lastVisitTime-historyItems[i+1].lastVisitTime) / 60000);
          //console.log(i + ": " + a);
        };
        // For each history item, get details on all visits.
        for (var i = 0; i < historyItems.length; ++i) {
          var url = historyItems[i].url 
          var processVisitsWithUrl = function(url) {
            // We need the url of the visited item to process the visit.
            // Use a closure to bind the  url into the callback's args.
            return function(visitItems) {
              processVisits(url, visitItems);
            };
          };
          chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
          numRequestsOutstanding++;
        }

        if (!numRequestsOutstanding) {
          onAllVisitsProcessed();
        }
      });
    // Maps URLs to a count of the number of times the user typed that URL into
    // the omnibox.

    var urlToCount = {};
    // Callback for chrome.history.getVisits().  Counts the number of
    // times a user visited a URL by typing the address.
      var ts = [];    
      var tons = [];
      var usp = [];
      var diff = 0;
      var rtrns = [];
    var processVisits = function(url, visitItems) {

//     console.log(visitItems[0]);
      for (var i = 0, ie = visitItems.length; i < ie; ++i) {
        if (!urlToCount[url]) {
          urlToCount[url] = 0;
        }
        urlToCount[url]++;
        tons.push(moment.unix(visitItems[i].visitTime/1000).format("MMMM Do YYYY, h:mm:ss a"));
 //       ts.push(url + ': ' + moment.unix(visitItems[i].visitTime/1000).format("MMMM Do YYYY, h:mm:ss a"));
        usp.push(url);
        ts.push(visitItems[i].visitTime/1000);
      }
      

 //       console.log(tons.length);
      // If this is the final outstanding call to processVisits(),
      // then we have the final results.  Use them to build the list
      // of URLs to show in the popup.
      if (!--numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    };
 

    // This function is called when we have the final list of URls to display.
    var onAllVisitsProcessed = function() {

      // Get the top scorring urls.
      urlArray = [];
      for (var url in urlToCount) {
        urlArray.push(url);
      }
 
      // Sort the URLs by the number of times the user typed them.
      urlArray.sort(function(a, b) {
        return urlToCount[b] - urlToCount[a];
      });
      buildPopupDom(divName, urlArray.slice(0, 10));
    };
  }
  document.addEventListener('DOMContentLoaded', function () {
    buildTypedUrlList("typedUrl_div");
  });