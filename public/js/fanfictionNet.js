$(function() {
  var requestedURL, updatedURL, progressMsg;
  var htmlArray = [];
  var counter = 0;

  requestedURL = localStorage.getItem("urlInput");

  loadChapterNo(requestedURL, function(chapterNo) {
    for (i=1; i<=chapterNo; i++) {
      updatedURL = updateURL(requestedURL, i);
      htmlToArray(updatedURL, htmlArray, i, function(databox) {
        // progress index
        progressMsg = "Fetching " + (counter++) + " of " + chapterNo + " chapters.";
        document.getElementById("progress").innerHTML = progressMsg;

        if (counter == chapterNo) {
          for (j=1; j<=chapterNo; j++) {
            loadStoryContent(databox[j], j);
          }
          document.getElementById("progress").outerHTML = "";
          document.getElementById("loading").outerHTML = "";
        }
      });
    }
    document.getElementById("storyContent").style.visibility = "visible";
  });
});

function loadStoryContent(htmlContent, index) {
  // to append summary
  if (index == 1) {
    var summaryDiv = document.getElementById("summary-container");
    var summaryContent = htmlContent.getElementsByClassName("xcontrast_txt");

    var title = summaryContent[3].textContent;
    var author = summaryContent[5].textContent;
    var summary = summaryContent[8].textContent;

    var summaryTitleNode = document.createElement("div");
    var summaryNode = document.createElement("p");

    summaryTitleNode.style.cssText = "font-weight: bold";
    summaryTitleNode.append(title + " by " + author);
    summaryNode.append(summary);
    summaryDiv.appendChild(summaryTitleNode);
    summaryDiv.appendChild(summaryNode);
  }

  var storyDiv = document.getElementById("story-container");
  var storyContent = htmlContent.getElementById("storytext");
  var chapterSelect = htmlContent.getElementById("chap_select");

  // get drop-down-list text and value
  var selectedText = chapterSelect.options[chapterSelect.selectedIndex].text;
  var selectedValue = chapterSelect.options[chapterSelect.selectedIndex].value;
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


// XMLHttpRequest to grab URL's HTML information
function htmlToArray(requestedURL, htmlArray, index, callback) {
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
      console.log("Total number of chapters: " + chapterNo);
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

function sendToServer() {
  console.log("POST request sent to server");
  var oReq = new XMLHttpRequest();
  oReq.open("POST", "/topdf", true);
  //Send the proper header information along with the request
  oReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  oReq.responseType = "blob";

  oReq.onload = function(oEvent) {
    var blob = oReq.response;
    //Create a link element, hide it, direct
    //it towards the blob, and then 'click' it programatically
    let a = document.createElement("a");
    a.style = "display: none";
    document.body.appendChild(a);
    //Create a DOMString representing the blob
    //and point the link element towards it
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'myFile.pdf';
    //programatically click the link to trigger the download
    a.click();
    //release the reference to the file by revoking the Object URL
    window.URL.revokeObjectURL(url);
    console.log("This will take a while...");
  };
  oReq.send(document.documentElement.outerHTML);
}
