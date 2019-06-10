const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
const WebSearchAPIClient = require('azure-cognitiveservices-websearch');

const express = require('express');
const request = require('request');

const app = express();
const bodyParser = require('body-parser');

const instegram ="instegram account"
const searchIn="webPages"

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')

app.use(express.static('public'));

let credentials = new CognitiveServicesCredentials('e7658383288e4b618e0fe77e25162fb3');
let webSearchApiClient = new WebSearchAPIClient(credentials);



app.get('/', function (req, res) {
  

    res.render('index', {page: null, error: null});
  })
  
  
  app.listen(1337, function () {
    console.log('Example app listening on port 3000!')
  })

  app.post('/', function (req, res) {
      
    let celebrity = req.body.celebrity;

    webSearchApiClient.web.search(celebrity+" "+instegram).then((result) => {
        //let properties = ["images", "webPages", "news", "videos"];
       // for (let i = 0; i < properties.length; i++) {
            if (result[searchIn]) {
                let str=result[searchIn].value[0].snippet+"\n"+result[searchIn].value[0].url;
                console.log(str);
                res.render('index', {page: str, error: null});

            } else {
                str=`No ${searchIn} data`
                console.log(str);
                res.render('index', {page: str, error: null});
            }
           // if (false) {
             //   //let weather =result[0].relatedSearches.id.parse(body)
               //     if(false){//weather.url == undefined){
                 //       res.render('index', {page: null, error: 'Error, please try again'});
                   // } else {
                     //   let weatherText = `This`//  ${weather.url} is the instegram of ${city}!`;
                       // res.render('index', {page: weatherText, error: null});
                    //}
               // }
       // }
    }).catch((err) => {
        res.render('index', {page: null, error: 'Error, please try again'});
    })


  })