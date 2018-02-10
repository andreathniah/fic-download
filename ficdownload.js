var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var pdf = require('html-pdf');

var app = express();
app.set("port", (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, "public")));

// for unlimited POST data sending
app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true
}));

app.use(bodyParser.json({
    limit: '50mb'
}));

var server = app.listen(app.get("port"), function() {
  var port = server.address().port;
  var host = server.address().address;
  console.log("Server started on http://" + host + " at port " + port);
});

app.get('/', function(req, res) {
  response.render("public/index");
});

app.post('/topdf', function(req, res) {
  console.log("POST request received from client");

  var htmlContent = JSON.stringify(req.body);
  var escapedHtml = htmlContent.replace(/\\n/g, "")
                                  .replace(/\\/g, "")
                                  .replace(/"}/g, "")
                                  .replace(/{"/g, "");

  fs.writeFile("public/tempPDF.html", escapedHtml, function (err) {
    if (err) throw err;
    console.log("File successfully saved");

    var html = fs.readFileSync('public/tempPDF.html', 'utf8');
    var options = {
      "format":"Letter" ,
      "orientation": "portrait",
      "footer":{
        "height":"15mm"
      },
      "quality": "75",
      "type":"pdf",
      "timeout":80000
    };

    console.log("Creating pdf...");
    pdf.create(html, options).toStream(function(err, stream) {
       if (err) {
         res.json({
           message: 'Sorry, we were unable to generate pdf',
         });
       }
       res.setHeader('Content-Type', 'application/pdf');
       res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
       stream.pipe(res);
       console.log('success');
     });

  });
});


// const util = require('util');
// let s = util.inspect(req.body).split(`Content-Disposition: form-data; name`);
// s.splice(0,1);
// let r=`{"`;
// s.forEach((e)=>{
//   r+=e.split(`\\r\\n------`)[0].replace(`"\\r\\n\\r\\n`,`":"`)
//                               .replace(`\': \'"`,``)
//                               .replace(`=`,``) +`",`
// });
// s=r.slice(0,-1)+`}`;
// console.log(s);
