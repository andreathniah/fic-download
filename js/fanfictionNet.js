// download: https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en

// only available for fanfiction.net


$(function() {
  var requestedURL, updatedURL;

  requestedURL = localStorage.getItem("urlInput");
  loadChapterNo(requestedURL, function(chapterNo) {
    for (i=1; i<=chapterNo; i++) {
      updatedURL = updateURL(requestedURL, i);
      loadStoryContent(updatedURL);
    }
    document.getElementById("storyContent").style.visibility = "visible";
    document.getElementById("loading").outerHTML = "";
    // convertToPDF();
    // generatePDF();

  });
});

// generate PDF with page breaks
function generatePDF() {
  // https://plnkr.co/edit/64KOSxMgDWfRUfg2bxfo?p=preview
  var pdf = new jsPDF();
  var pdfName = "pagebreaks.pdf";
  var options = {width: 170, pagesplit: true};

  var $div = $(".chapter-container"); // gets all div of the same name
  var noRecursionNeeded = $div.length - 1;
  var currentRecursion = 0;

  function recursiveAddHtmlAndSave(currentRecursion, totalRecursions){
    //Once we have done all the divs save the pdf
    if(currentRecursion == totalRecursions){
      pdf.save(pdfName);
    }
    else {
      pdf.addPage();
      pdf.fromHTML($('.chapter-container')[currentRecursion], 15, 15, options, function(){
        console.log("Appending - chapter " + currentRecursion);
        currentRecursion++;
        recursiveAddHtmlAndSave(currentRecursion, totalRecursions);
      });

    }
  }

  pdf.fromHTML($('.summary-container')[currentRecursion], 15, 15, options, function(){
    console.log("Appending - summary");
    recursiveAddHtmlAndSave(currentRecursion, noRecursionNeeded);
  });

}

// generate PDF without page breaks
function convertToPDF() {
  // known issues: https://github.com/MrRio/jsPDF/issues/648
  var doc = new jsPDF();

  doc.fromHTML($('#storyContent')[0], 15, 15, { width: 170 }, function() {
    doc.save('continous.pdf');
  });
}

// XMLHttpRequest to grab URL's HTML information
function loadStoryContent(requestedURL, index) {
  var xhttp = new XMLHttpRequest();
  var proxyURL = getProxyURL(requestedURL);

  xhttp.open("GET", proxyURL, false);
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var httpDoc = domParse(xhttp.responseText);
      var storyDiv = document.getElementById("story-container");
      var summaryDiv = document.getElementById("summary-container");

      getStoryContent(httpDoc, storyDiv, summaryDiv);
    }
  }
  xhttp.send();
}

// isolate needed HTML content render it to innerHTML
function getStoryContent(httpDoc, storyDiv, summaryDiv) {

  var storyContent = httpDoc.getElementById("storytext");
  var chapterSelect = httpDoc.getElementById("chap_select");

  // get drop-down-list text and value
  var selectedText = chapterSelect.options[chapterSelect.selectedIndex].text;
  var selectedValue = chapterSelect.options[chapterSelect.selectedIndex].value;
  console.log(selectedText);

  //        var dlNode = document.createElement("dl");
  //        var ddNode = document.createElement("dd");
  //        var linkNode = document.createElement("a");
  //
  //        linkNode.setAttribute("href", "#chapter-" + selectedValue);
  //        linkNode.innerHTML = selectedText;
  //
  //        ddNode.appendChild(linkNode);
  //        dlNode.appendChild(ddNode);
  //        summaryDiv.appendChild(dlNode);
  //

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

// XMLHttpRequest callback to grab total no of chapters
function loadChapterNo(requestedURL, callback) {
  var xhttp = new XMLHttpRequest();
  console.log("requestedURL: " + requestedURL);
  var proxyURL = getProxyURL(requestedURL);

  xhttp.open("GET", proxyURL, true);
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200 && callback) {
      var httpDoc = domParse(xhttp.responseText);
      var chapterNo = getChapterNo(httpDoc);
      console.log("chapter no: " + chapterNo);
      callback(chapterNo);
    }
  }
  xhttp.send();
}

// isolate nav-bar to get the last digit of the chapter
function getChapterNo(httpDoc) {
  var chapterNo, lastValue;

  chapterNo = httpDoc.getElementById("chap_select");
  lastValue = chapterNo.options[chapterNo.options.length - 1].value;

  return lastValue;
}

function getProxyURL(requestedURL) {
  var proxyURL, urlArray, totalLength, part1, part2;

  urlArray = requestedURL.split("/");
  totalLength = (urlArray[0] + urlArray[1]).length + 6;
  part1 = "https://cors-anywhere.herokuapp.com/";
  part2 = requestedURL.substr(totalLength, requestedURL.lastIndexOf("/"));
  proxyURL = part1 + part2;

  return proxyURL;
}

function updateURL(requestedURL, chapterIndex) {
  var updatedURL, part1, part2, urlArray, digitInChapter;

  urlArray = requestedURL.split("/");
  digitInChapter = urlArray[5].toString().length;

  part1 = requestedURL.substr(0, requestedURL.lastIndexOf("/") - digitInChapter);
  part2 = requestedURL.substr(requestedURL.lastIndexOf("/"));
  updatedURL = part1 + chapterIndex + part2;

  return updatedURL;
}


function domParse(data) {
  var parser = new DOMParser();
  var httpDoc = parser.parseFromString(data, "text/html");

  return httpDoc;
}
