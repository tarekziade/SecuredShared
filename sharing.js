var recipientPK = "b0085575e3bbe971132d5cf08676065c5222bedb193a3b6583e10db4ac302c20";
var recipientSK = "3bd903fd756a36bf09fc719543bff67b1e67015cad211a24f405884c5d536066";
var senderPK;
var senderSK;


function generateKeyPair() {
  var nacl = nacl_factory.instantiate();
  kp = nacl.crypto_box_keypair();
  return {'pk': nacl.to_hex(kp.boxPk), 'sk': nacl.to_hex(kp.boxSk)};
};


function readFile(filePickerId, cb) {
    var fileInput = document.getElementById(filePickerId);
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
      cb(file.name, reader.result);
    }

    reader.readAsBinaryString(file);
};


/* This should ask mozillians.org for the public key - given an e-mail*/
function getRecipientPK(email) {
  return recipientPK;
}

function encryptData(rcpt, data) {
  var rcptPK = getRecipientPK(rcpt);
  var nacl = nacl_factory.instantiate();
  var message = nacl.encode_utf8(data);
  var nonce = nacl.crypto_box_random_nonce();
  var packet = nacl.crypto_box(message, nonce, nacl.from_hex(rcptPK),
                               nacl.from_hex(senderSK));
  return nacl.to_hex(packet);
};


function send(recipientId, filePickerId) {
  var rcpt = document.getElementById(recipientId).value;

  readFile(filePickerId, function(filename, data) {
      var encrypted = encryptData(rcpt, data);
      share(rcpt, filename, encrypted);
  });
}

var client = new Dropbox.Client({ key: '3do0rbe854mglzm' });

client.authenticate({ interactive: false }, function (error, client) {
  if (error) {
          alert('Error: ' + error);
  }
  else {
   //alert('connected');
  }
});



function share(recipient, filename, encrypted) {
  if (client.isAuthenticated()) {
  alert('sending the file to dropbox');
      client.writeFile(filename, encrypted, function (error) {
          if (error) {
              alert('Error: ' + error);
          } else {

              alert('file sent');
              client.makeUrl(filename, { download: true }, function (error, link) {
                 if (error) alert('Error: ' + error);
                   alert('Got back URL: ' + link.url);
              });
          }
      });

  }
else {
  alert('not connected to dropbox');

  }
};


var request = indexedDB.open("SecuredShared", 2);
var db;

request.onsuccess = function (event) {
  db = request.result;
  if (!db.objectStoreNames.contains("SecuredShared")) {
    db.createObjectStore("SecuredShared");
  }
  loadKeys();
};


request.onupgradeneeded = function (event) {
  console.log("Creating objectStore")
  db = event.target.result;
  db.createObjectStore("SecuredShared");
  if (!db.objectStoreNames.contains("SecuredShared")) {
    db.createObjectStore("SecuredShared");
  }
  loadKeys();
};


function storeKeys() {
  var keys = generateKeyPair();
  var transaction = db.transaction(["SecuredShared"], "readwrite");
  transaction.objectStore("SecuredShared").put(keys.pk, "pk");
  transaction.objectStore("SecuredShared").put(keys.sk, "sk");
  loadKeys();
};


function loadKeys() {
  getKeys(function (pk, sk){
    senderPK = pk;
    senderSK = sk;
    document.getElementById("pk").value = pk;
    document.getElementById("sk").value = sk;
  });
};


function getKeys(cb) {
  var transaction = db.transaction(["SecuredShared"], "readonly");
  var store = transaction.objectStore("SecuredShared");
  store.get("pk").onsuccess = function (event) {
      var pk = event.target.result;
      store.get("sk").onsuccess = function (event) {
          var sk = event.target.result;
          cb(pk, sk);
      };
  };
}


