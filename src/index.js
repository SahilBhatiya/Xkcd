/* Basic Packages */
const requests = require('requests');
const http = require('http');
const fs = require('fs');

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


let ViewsCount = [];
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
            createArray(Max_pages);

            console.log('Fetched Maxmium Pages : ' + Max_pages);
        });

})();

async function createArray(Max_pages) {
    if (!CheckViewsFileExsits()) {
        let ViewArray = [];
        for (let i = 1; i <= Max_pages; i++) {
            ViewArray.push({
                View: 0
            });
        }
        let data = JSON.stringify(ViewArray);
        fs.writeFile("Views.json", data, (err) => {});
    }
    ReadViews();
}

function ReadViews() {
    fs.readFile('Views.json', 'utf8', (err, data) => {
        ViewsCount = JSON.parse(data);
    });
}

async function WriteViews() {
    let data = JSON.stringify(ViewsCount);
    fs.writeFile("Views.json", data, (err) => {});
}

function CheckViewsFileExsits() {
    if (fs.existsSync("./Views.json")) {
        return true;
    } else {
        return false;
    }
}

/* Api To Display Data On Website */
function RenderWebsite(Id, res) {
    Id = Id == 404 ? 405 : Id;
    ViewsCount[Id - 1].View += 1;
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    requests(`https://xkcd.com/${Id}/info.0.json`)
        .on('data', (chunk) => {
            const objData = JSON.parse(chunk);
            res.render("index", {
                CrrNum: objData.num,
                CrrTitle: objData.title,
                firstVal: `\\${1}`,
                prevVal: `\\${objData.num-1 >=1 ? objData.num-1 : Max_pages}`,
                nextVal: `\\${objData.num+1 <= Max_pages ? objData.num+1 : 1}`,
                lastVal: `\\${Max_pages}`,
                CrrDate: `${objData.day}  ${monthNames[objData.month-1]}, ${objData.year}`,
                Image: objData.img,
                alt: objData.alt,
                Max_value: Max_pages,
                Views: ViewsCount[Id - 1].View
            });
        })
        .on('end', (err) => {
            if (err) return console.log('connection closed due to errors', err);
            WriteViews();
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
});

app.post('/GenerateRandom', (req, res) => {
    const Id = Math.floor((Math.random() * Max_pages) + 1);
    res.end(Id.toString());
});


/* To Create Server */
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});