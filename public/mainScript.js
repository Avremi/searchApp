
console.log('main begin')

function search() {
  var req = new XMLHttpRequest();
  var url = '/';


  req.open('post', url, true);
  req.addEventListener('load', onLoad);
  req.addEventListener('error', onError);
  var celeb = { 'celeb': document.getElementById("input").value }

  req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  req.send(JSON.stringify(celeb))
}

function onLoad() {
  var response = this.responseText;
  var parsedResponse = JSON.parse(response);

  var message = parsedResponse['message'];
  var url = parsedResponse['url'];
  var celebrityList = parsedResponse['celebritiesList'];

  if (message && url) {
    document.getElementById('errMessage').innerHTML = null;
    document.getElementById('url').innerHTML = message;
    document.getElementById('url').href = url;

  }
  else {
    document.getElementById('url').innerHTML = "";
    document.getElementById('url').href = "";
    document.getElementById('errMessage').innerHTML = message;
  }

  if (celebrityList) {
    document.getElementById('celebList').innerHTML = '';
    for (let i = celebrityList.length - 1; i >= 0; i--) {
      let strUrl = celebrityList[i].url;
      document.getElementById('celebList').innerHTML += "<li>" + "<a href=" + celebrityList[i].url + ">" + celebrityList[i]._id + "</a>" + "</li>"
    }
  }
}

function eval(e) {
  if (e.keyCode == 13) {
    search();
  }
}

function onError() {
  console.log('error receiving async AJAX call');
}






