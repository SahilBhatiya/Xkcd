/* Basic Packages */
const requests = require('requests');
const http = require('http');

/* Express Package */
const express = require('express');
const { Console } = require('console');
const app = express();
const port = 8000;

/* To Allow Html To Use Css and Javascript */
app.use(express.static('public'))

/* Ports */
app.set('port', process.env.PORT || port);

/* Engine - Handlebars */
app.set("view engine", "hbs");

/* Api To Get Maxmimum Number Of Comics */
const Api = `https://xkcd.com/info.0.json`;
let Max_pages = 0;

(() => {
    requests(Api)
        .on('data', (chunk) => {
            const objData = JSON.parse(chunk);
            const ArrData = [objData];
            Max_pages = ArrData[0].num;

        })
        .on('end', (err) => {
            if (err) return console.log('connection closed due to errors', err);
            console.log('end');
        });

})();

/* Api To Display Data On Website */
function RenderWebsite(Id, res) {
    requests(`https://xkcd.com/${Id}/info.0.json`)
        .on('data', (chunk) => {
            const objData = JSON.parse(chunk);
            res.render("index", {
                CrrNum: objData.num,
                CrrTitle: objData.title,
                firstVal: `\\${1}`,
                prevVal: `\\${objData.num-1 >=1 ? objData.num-1 : 1}`,
                nextVal: `\\${objData.num+1 <= Max_pages ? objData.num+1 : Max_pages}`,
                lastVal: `\\${Max_pages}`,
                CrrDate: `${objData.day} / ${objData.month} / ${objData.year}`,
                Image: objData.img,
                alt: objData.alt,
                Max_value: Max_pages
            });
        })
        .on('end', (err) => {
            if (err) return console.log('connection closed due to errors', err);
            console.log('end');
        });
}

/* To Handle Basic Webpage (If Someone tries to remove numbers from url this will handle it) */
app.get('/', (req, res) => {
    RenderWebsite(1, res);
});

/* To View Data On webpage */
app.get('/:Id', function(req, res) {
    if (isNaN(req.params.Id) || parseInt(req.params.Id) > Max_pages)
        res.render("error");
    else {
        let Id = isNaN(parseInt(req.params.Id)) ? 1 : req.params.Id.toString();
        RenderWebsite(Id, res);
    }
});

/* Handle Errors (Unknown url and Not Integer) */
app.get("*", (req, res) => {
    res.render("error");
})

/* To Create Server */
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});