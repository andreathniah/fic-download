$(function() {
    var requestedURL = localStorage.getItem("urlInput");
    var submitStatus;
    loadChapterNo(requestedURL, function(databox) {    
        m18Status = databox.getElementById("is_of_age"); //M18 tag
        
        console.log(m18Status);
        
        if (m18Status != null) {
            databox.getElementsByTagName("form")[1].submit();
            // maybe need to refresh the page?
            console.log("submitted");
        }
    });
    
    console.log("ended");
    
//    loadChapterNo(requestedURL, function(databox) {
//        executeScrapping(requestedURL, databox);
//    });
    
});

function executeScrapping(requestedURL, databox) {
    var chapterNo = getChapterNo(databox);

    for (i=0; i<=chapterNo; i++) {
        // from foreword to last chapter
        var updatedURL = updateURL(requestedURL, i); 
        loadStoryContent(updatedURL, i);
    }

    document.getElementById("storyContent").style.visibility = "visible";
    document.getElementById("loading").outerHTML = ""; 
}


// XMLHttpRequest to grab URL's HTML information
function loadStoryContent(requestedURL, index) {
    var xhttp = new XMLHttpRequest();

    xhttp.open("GET", requestedURL, false);
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var httpDoc = domParse(xhttp.responseText);

            if (index == 0) {
                console.log("Appending summary...");
                var summaryDiv = document.getElementById("summary-container");
                var summaryContent = httpDoc.getElementById("bodyText");
                summaryDiv.appendChild(summaryContent);
            }
            else {
                var storyDiv = document.getElementById("story-container");
                getStoryContent(httpDoc, storyDiv);  
            }
        }
    }
    xhttp.send();
}

// isolate needed HTML content render it to innerHTML 
function getStoryContent(httpDoc, storyDiv) {

    // https://www.asianfanfics.com/story/view/1192719/11/yes-ma-am-friendship-romance-teacher-school-exo-chen-firstfrost (members, subscribers only)
    // need to replace style type to just <text-align: justify>
    // <text-align:justify;color: transparent !important;text-shadow: 0 0 5px rgba(0,0,0,0.5) !important;>
    // <text-align: justify; display: none;> 
    
    var storyContent = httpDoc.getElementById("user-submitted-body");        
    var chapterSelect = httpDoc.getElementsByClassName("chapter-nav");

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

// XMLHttpRequest callback to grab total no of chapters
function loadChapterNo(requestedURL, callback) {
    var xhttp = new XMLHttpRequest();

    xhttp.open("GET", requestedURL, true);
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

function updateURL(requestedURL, chapterIndex) {    
    var updatedURL, part1, part2, urlArray, digitInChapter;
    
    urlArray = requestedURL.split("/");
    
    // requestedURL is foreword
    if ((urlArray.length < 8) || (chapterIndex == 0)) {
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
    return updatedURL;
}

function domParse(data) {
    var parser = new DOMParser();
    var httpDoc = parser.parseFromString(data, "text/html");

    return httpDoc;
}
