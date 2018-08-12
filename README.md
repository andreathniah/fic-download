# fic-download

A simple web app that loads all chapters of a fan-fiction into one page and allow users to download them

## Description

Want to print the entire fanfiction? Do a simple CTF-F on the entire story? Or just a pure lazy person that just hates clicking the "next" button? fic-download helps you to do all of them!

Demo link: [http://www.andreathniah.com/ficdownloader/](http://www.andreathniah.com/ficdownloader/)

## Authors

- Andrea Thniah [@andreathniah](http://www.andreathniah.com/)

## Todo

- Validation to force all fanfiction links to default to the first chapter
  `m.fanfiction.net/s/<STORY_ID>/<THIS_PART_CAN_BE_BLANK>`

- Add summary by navigating to user profile

```javascript
// navigate to author page from story page
document.querySelector("#content > div > a");

// find div that has summary description
const searchText = "Civil War";
var render = $("a")
	.filter(function() {
		return $(this).text() == searchText;
	})
	.parent()[0];

// get the summary description in text
var nodes = render.childNodes;
var result = "";
for (var i = 0; i < nodes.length; i++) {
	if (nodes[i].nodeType == 3) {
		result += nodes[i].nodeValue;
	}
}
```
