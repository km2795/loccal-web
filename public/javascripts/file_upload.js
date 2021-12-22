let fileList = [];

(function () {
  let form = document.getElementById('source-form');
  let submitForm = document.getElementById('source-upload-btn');

  document.getElementById('source-upload-form').onchange = function () {
    fileList = document.getElementById('source-upload-form').files;
    if (fileList.length > 0) {
      document.getElementById('loc-output').style.display = 'none';
    }
    let node = document.getElementById('selected-files-cont');
    let nodeString = "<tr><th>Name</th><th>Type</th><th>Size</th><th>LOC</th></tr>";
    for (let i = 0; i < fileList.length; i++) {
      let file = fileList[i];
      nodeString += '<tr><td>' + file.name + '</td><td>' + file.type + '</td><td>' + quantifyBytes(file.size) +'</td><td>-</td></tr>';
    }
    node.innerHTML = nodeString;
  };

  form.onsubmit = function (e) {
    e.preventDefault();

    if (document.getElementById('source-upload-form').files.length < 1) {
      document.getElementById('loc-output').innerHTML = "<p>No file selected.</p>";
      return;
    }

    submitForm.innerHTML = "Uploading...";

    var oReq = new XMLHttpRequest();
    oReq.open("POST", "loc", true);
    oReq.onload = function(oEvent) {
      if (oReq.status == 200) {
        let res = JSON.parse(oReq.responseText);
        showTable(res.data);
        // let appendData = "";
        // for (let prop in res.data) {
        //   appendData += "<p>" + prop + ": " + res.data[prop] + "</p>"
        // }
        // document.getElementById('loc-output').innerHTML = appendData/* JSON.stringify(res.data) */;
      } else {
        console.log("Error " + oReq.status + " occurred when trying to upload your file.<br \/>");
      }
    };
    oReq.send(new FormData(form));
  }
}());

function showTable(data) {
  let node = document.getElementById('selected-files-cont');
  node.innerHTML = "";
  let nodeString = "<tr><th>Name</th><th>Type</th><th>Size</th><th>LOC</th></tr>";
  for (let i = 0; i < fileList.length; i++) {
    let file = fileList[i];
    nodeString += '<tr><td>' + file.name + '</td><td>' + file.type + '</td><td>' + quantifyBytes(file.size) +'</td><td>' + data[file.name] + '</td></tr>';
  }
  node.innerHTML = nodeString;
}

function quantifyBytes(bytes) {
  let len = bytes.toString().length;
  
  if (len < 04) { return bytes + " B"; }
  else if (len < 07) { return (bytes / 1000) + " KB"; }
  else if (len < 10) { return (bytes / 1000000) + " MB"; }
  else if (len < 13) { return (bytes / 1000000000) + " GB"; }
  else if (len < 16) { return (bytes / 1000000000000) + " TB"; }
}
