const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
const WebSearchAPIClient = require('azure-cognitiveservices-websearch');

let credentials = new CognitiveServicesCredentials('dd24307509d8423ea5a0e72ddfe570b3');
let webSearchApiClient = new WebSearchAPIClient(credentials);
console.log(1);

const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,'public')));

console.log(2);
const MongoClient = require('mongodb').MongoClient;
const uri="mongodb+srv://Avremi:AHh72507250.@celebrities-uyr4n.azure.mongodb.net/celeb?retryWrites=true&w=majority"

const dbName='celeb';
const dbCollection='names';


const searchFor ="instagram"
const searchIn="webPages"
const firstResults=5;
const pattern="https://www.";
const errMessage='Error, please try again';
const notFoundMessage='notFoundMessage';

console.log(3);



let arrayResult=null;
MongoClient.connect(uri, function(err, db) {
  if (err) return;
  if(!db){
     console.log('db=null');
     return;
  }

var dbo = db.db(dbName);

dbo.collection(dbCollection).find({}).toArray(function(err, result) {
  console.log(result);
  arrayResult=result;
  db.close();
});
});


console.log(4);








//app.get('/', function (req, res) {
   
//var celebritiesList;
   // MongoClient.connect(uri, function(err, db) {
        // Paste the following examples here
       // if (err) throw err;
     // var dbo = db.db("celeb");
      
      
     // celebritiesList= arrayResult=dbo.collection("names").find({}).toArray(function(err, result) {
        //if (err) throw err;
       // console.log(result);
        //db.close();
     // });
      //});
    //document.getElementById(errMessage).innerHTML="testtttttt";
    //res.sendFile(path.join(__dirname,'/index.html'),{message: null, url: null, celebritiesList :[1,2,3,4] });

   //res.send('response')
   
  //})
  
  var port = app.listen(process.env.PORT||3000);
  app.listen(port, function () {
    console.log('Example app listening on port 3000!')
  });


  app.post('/', function (req, res) { 
    let celebrity=req.body.celeb;
    search(res,celebrity);
  });


  function search(res,celebrity){
    var dataToSendToClient;
    var celebritiesList=null;
    var strMessage;
    if(celebrity==null || celebrity==''){
      updateDB(null,null);
                    dataToSendToClient = {'message': null, 'url': null, 'celebritiesList':arrayResult };
                    strMessage = JSON.stringify(dataToSendToClient);
                    res.send(strMessage);
    }
    else{

    webSearchApiClient.web.search(celebrity+" "+searchFor).then((result) => {     
                let message= searchFor+' account of '+celebrity;
                let url=findMatches(result[searchIn], searchFor, firstResults);
                console.log(message);
                if(url){
                    updateDB(url,celebrity);
                    dataToSendToClient = {'message': message, 'url': url, 'celebritiesList':arrayResult };
                    strMessage = JSON.stringify(dataToSendToClient);
                    res.send(strMessage);
                }
                else{
                    dataToSendToClient = {'message': message +notFoundMessage, 'url': null,'celebritiesList':arrayResult };
                    strMessage = JSON.stringify(dataToSendToClient);
                    res.send(strMessage);
                }
    }).catch((err) => {
         dataToSendToClient = {'message': errMessage, 'url': null ,'celebritiesList':arrayResult};
         strMessage = JSON.stringify(dataToSendToClient);
         res.send(strMessage);
    })
  }
  }


  function findMatches(results,searchFor,firstResults){
      if(results){
          resultValues=results.value;
        for(let i=0;i<firstResults;i++){
            if(match(resultValues[i],searchFor)){
                return resultValues[i].url;
            }
        }
      }
      return null;
  }

  function match(value,searchFor){
    let url=value.url;
    let fullPattern=pattern+searchFor;
      let prefix=url.substr(0,fullPattern.length);
      return url.length>fullPattern.length && fullPattern==prefix;
  }

function updateDB(url,celebrity){
    
    MongoClient.connect(uri, function(err, db) {
        if (err) console.log( err);
        if(!db){
           console.log('db=null');
           return null;
        }

      var dbo = db.db(dbName);
      if(url!=null&&celebrity!=null){
      var celeb = { '_id': celebrity, 'url':url };
      if(dbo.collection(dbCollection).find({"_id" : celebrity})){
        dbo.collection(dbCollection).deleteOne({"_id" : celebrity})
      }
      dbo.collection(dbCollection).insertOne(celeb, function(err, res) {
        console.log("1 document inserted");
      });
    }
      dbo.collection(dbCollection).find({}).toArray(function(err, result) {
        console.log(result);
        arrayResult=result;
        db.close();
      });
      });
      return arrayResult;
}
  