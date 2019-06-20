const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
const WebSearchAPIClient = require('azure-cognitiveservices-websearch');

let credentials = new CognitiveServicesCredentials('dd24307509d8423ea5a0e72ddfe570b3');
let webSearchApiClient = new WebSearchAPIClient(credentials);


const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Avremi:AHh72507250.@celebrities-uyr4n.azure.mongodb.net/celeb?retryWrites=true&w=majority"

const dbName = 'celeb';
const dbCollection = 'names';


const searchFor = "instagram"
const searchIn = "webPages"
const firstResults = 5;
const pattern = "https://www.";
const errMessage = 'Error, please try again';
const notFoundMessage = ' notFoundMessage';



let arrayResult = null;
initDB();

function initDB(){
  MongoClient.connect(uri, function (err, db) {
    if (err) return;
    if (!db) {
      console.log('db=null');
      return;
    }
  
    var dbo = db.db(dbName);
  
    dbo.collection(dbCollection).find({}).toArray(function (err, result) {
      console.log(result);
      arrayResult = result;
      db.close();
    });
  });
  
}



var port = app.listen(process.env.PORT || 3000);
app.listen(port, function () {
  console.log('Celebrity Search app listening on port 3000!')
});


app.post('/', function (req, res) {
  let celebrity = req.body.celeb;
  search(res, celebrity);
});


function search(res, celebrity) {
  var dataToSendToClient;
  var celebritiesList = null;
  var strMessage;
  if (celebrity == null || celebrity == '') {
    updateDB(null, null);
    dataToSendToClient = { 'message': null, 'url': null, 'celebritiesList': arrayResult };
    strMessage = JSON.stringify(dataToSendToClient);
    res.send(strMessage);
  }
  else {

    webSearchApiClient.web.search(celebrity + " " + searchFor).then((result) => {
      let message = searchFor + ' account of ' + celebrity;
      let url = findMatches(result[searchIn], searchFor, firstResults);
      console.log(message);
      if (url) {
        updateDB(url, celebrity);
        dataToSendToClient = { 'message': message, 'url': url, 'celebritiesList': arrayResult };
        strMessage = JSON.stringify(dataToSendToClient);
        res.send(strMessage);
      }
      else {
        dataToSendToClient = { 'message': message + notFoundMessage, 'url': null, 'celebritiesList': arrayResult };
        strMessage = JSON.stringify(dataToSendToClient);
        res.send(strMessage);
      }
    }).catch((err) => {
      dataToSendToClient = { 'message': errMessage, 'url': null, 'celebritiesList': arrayResult };
      strMessage = JSON.stringify(dataToSendToClient);
      res.send(strMessage);
    })
  }
}


function findMatches(results, searchFor, firstResults) {
  if (results) {
    resultValues = results.value;
    for (let i = 0; i < firstResults; i++) {
      if (match(resultValues[i], searchFor)) {
        return resultValues[i].url;
      }
    }
  }
  return null;
}

function match(value, searchFor) {
  let url = value.url;
  let fullPattern = pattern + searchFor;
  let prefix = url.substr(0, fullPattern.length);
  return url.length > fullPattern.length + 6 && fullPattern == prefix;
}

function updateDB(url, celebrity) {

  MongoClient.connect(uri, function (err, db) {
    if (err) console.log(err);
    if (!db) {
      console.log('db=null');
      return null;
    }

    var dbo = db.db(dbName);
    if (url != null && celebrity != null) {
      var celeb = { '_id': celebrity, 'url': url };

      dbo.collection(dbCollection).deleteOne({ "_id": celebrity }, function (err, result) {
        dbo.collection(dbCollection).insertOne(celeb, function (err, result) {
          dbo.collection(dbCollection).find({}).toArray(function (err, result) {
            console.log(result);
            arrayResult = result;
            db.close();
          });
        });
      })


    }
    else {
      dbo.collection(dbCollection).find({}).toArray(function (err, result) {
        console.log(result);
        arrayResult = result;
        db.close();
      });
    }
  });

  return arrayResult;
}
