// https://www.asianfanfics.com/story/view/1192719/11/yes-ma-am-friendship-romance-teacher-school-exo-chen-firstfrost (members, subscribers only)
// issue when the given url is not a chaptered number

$(function() {
  var requestedURL = localStorage.getItem("urlInput");
  var submitStatus;
  loadChapterNo(requestedURL, function(databox) {
    m18Status = databox.getElementById("is_of_age"); //M18 tag

    console.log("m18Status = " + m18Status);
    if (m18Status != null) {
      databox.getElementsByTagName("form")[1].submit();
      // maybe need to refresh the page?
    }
  });

  loadChapterNo(requestedURL, function(databox) {
    executeScrapping(requestedURL, databox);
  });

});

function executeScrapping(requestedURL, databox) {
  var htmlArray = [];
  var counter = 0; // need to consider the overview pagge
  var chapterNo = getChapterNo(databox);
  console.log("Total no of chapters: " + chapterNo);
  // from foreword to last chapter
  for (i=0; i<=chapterNo; i++) {
      var updatedURL = updateURL(requestedURL, i);
      htmltoArray(updatedURL, htmlArray, i, function(resultbox) {
        progressMsg = "fetching " + (counter++) + " of " + chapterNo;
        document.getElementById("progress").innerHTML = progressMsg;

        if (counter > chapterNo) {
          for (j=0; j<=chapterNo; j++) {
            loadStoryContent(resultbox[j], j);
          }
          document.getElementById("progress").outerHTML = "";
          document.getElementById("loading").outerHTML = "";
        }
      });
  }
  document.getElementById("storyContent").style.visibility = "visible";
}


// XMLHttpRequest to grab URL's HTML information
function loadStoryContent(htmlContent, index) {
  // append the summary
  if (index == 0) {
    var summaryDiv = document.getElementById("summary-container");
    var summaryContent = htmlContent.getElementById("bodyText");
    summaryDiv.appendChild(summaryContent);
  }
  else {
    var storyDiv = document.getElementById("story-container");
    var storyContent = htmlContent.getElementById("user-submitted-body");
    var chapterSelect = htmlContent.getElementsByClassName("chapter-nav");

    // get drop-down-list text and value
    var selectedText = chapterSelect[0].options[chapterSelect[0].selectedIndex].text;
    var selectedValue = chapterSelect[0].options[chapterSelect[0].selectedIndex].value;
    console.log(selectedText);

    var titleNode = document.createElement("p");
    titleNode.style.cssText = "font-weight: bold";
    titleNode.append(selectedText); // append because its not a node, its a normal string

    var storyNode = document.createElement("div");
    storyNode.id = "chapter-" + selectedValue;
    storyNode.className = "row twelve columns chapter-container";

    storyNode.appendChild(titleNode);
    storyNode.appendChild(storyContent);
    storyDiv.appendChild(storyNode);
  }
}

function htmltoArray(requestedURL, htmlArray, index, callback) {
  var xhttp = new XMLHttpRequest();
  var proxyURL = getProxyURL(requestedURL);

  xhttp.open("GET", proxyURL, true);
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200 && callback) {
      var httpDoc = domParse(xhttp.responseText);
      htmlArray[index] = httpDoc;
      callback(htmlArray);
    }
  }
  xhttp.send();
}

// // XMLHttpRequest to grab URL's HTML information
// function loadStoryContent(requestedURL, index) {
//   var xhttp = new XMLHttpRequest();
//   var proxyURL = getProxyURL(requestedURL); // ERROR HERE
//
//   xhttp.open("GET", proxyURL, false);
//   xhttp.onreadystatechange = function() {
//     if (xhttp.readyState == 4 && xhttp.status == 200) {
//       var httpDoc = domParse(xhttp.responseText);
//
//       if (index == 0) {
//         console.log("Appending summary...");
//         var summaryDiv = document.getElementById("summary-container");
//         var summaryContent = httpDoc.getElementById("bodyText");
//         summaryDiv.appendChild(summaryContent);
//       }
//       else {
//         var storyDiv = document.getElementById("story-container");
//         getStoryContent(httpDoc, storyDiv);
//       }
//     }
//   }
//   xhttp.send();
// }

// isolate needed HTML content render it to innerHTML
// function getStoryContent(httpDoc, storyDiv) {
//   var storyContent = httpDoc.getElementById("user-submitted-body");
//   var chapterSelect = httpDoc.getElementsByClassName("chapter-nav");
//
//   // get drop-down-list text and value
//   var selectedText = chapterSelect[0].options[chapterSelect[0].selectedIndex].text;
//   var selectedValue = chapterSelect[0].options[chapterSelect[0].selectedIndex].value;
//   console.log(selectedText);
//
//   var titleNode = document.createElement("p");
//   titleNode.style.cssText = "font-weight: bold";
//   titleNode.append(selectedText); // append because its not a node, its a normal string
//
//   var storyNode = document.createElement("div");
//   storyNode.id = "chapter-" + selectedValue;
//   storyNode.className = "row twelve columns chapter-container";
//
//   storyNode.appendChild(titleNode);
//   storyNode.appendChild(storyContent);
//   storyDiv.appendChild(storyNode);
//
// }

// XMLHttpRequest callback to grab total no of chapters
function loadChapterNo(requestedURL, callback) {
  var xhttp = new XMLHttpRequest();
  var proxyURL = getProxyURL(requestedURL);

  xhttp.open("GET", proxyURL, true);
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200 && callback) {
      var httpDoc = domParse(xhttp.responseText);
      callback(httpDoc);
    }
  }
  xhttp.send();
}

// isolate nav-bar to get the last digit of the chapter
function getChapterNo(httpDoc) {
  var chapterNo, lastValue, lastChapter;

  // chapterNo is a HTMLCollection
  chapterNo = httpDoc.getElementsByClassName("chapter-nav");
  lastValue = chapterNo[0].options[chapterNo[0].options.length - 1].value;
  lastChapter = lastValue.split("/");

  return lastChapter[4];
}

// update requestedURL to the correct URL base on its chapter
function updateURL(requestedURL, chapterIndex) {
  var updatedURL, part1, part2, urlArray, digitInChapter;

  urlArray = requestedURL.split("/");

  if (urlArray.length < 8) { // starting requestedURL is a foreword
    part1 = requestedURL.substr(0, requestedURL.lastIndexOf("/"));
    part2 = requestedURL.substr(requestedURL.lastIndexOf("/"));

    if (chapterIndex == 0) {
      updatedURL = part1 + part2;
    }
    else {
      updatedURL = part1 + "/" + chapterIndex + part2;
    }
  }
  else { // starting requestedURL is a chapter page
    if (chapterIndex == 0) {
        // get rid of chapter and /
        digitInChapter = urlArray[6].toString().length + 1;
        part1 = requestedURL.substr(0, requestedURL.lastIndexOf("/") - digitInChapter);
        part2 = requestedURL.substr(requestedURL.lastIndexOf("/"));
        updatedURL = part1 + part2;
    }
    else {
        digitInChapter = urlArray[6].toString().length;
        part1 = requestedURL.substr(0, requestedURL.lastIndexOf("/") - digitInChapter);
        part2 = requestedURL.substr(requestedURL.lastIndexOf("/"));
        updatedURL = part1 + chapterIndex + part2;
    }
  }
  return updatedURL;
}

// facilate node.js CORS-anywhere npm
function getProxyURL(requestedURL) {
  var proxyURL, urlArray, totalLength, part1, part2;

  urlArray = requestedURL.split("/");
  totalLength = (urlArray[0] + urlArray[1]).length + 6;
  part1 = "https://cors-anywhere.herokuapp.com/";
  part2 = requestedURL.substr(totalLength, requestedURL.lastIndexOf("/"));
  proxyURL = part1 + part2;

  return proxyURL;
}

// convert XML data into a HTMLDocument
function domParse(data) {
  var parser = new DOMParser();
  var httpDoc = parser.parseFromString(data, "text/html");

  return httpDoc;
}
