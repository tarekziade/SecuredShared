var recipientPK = "b0085575e3bbe971132d5cf08676065c5222bedb193a3b6583e10db4ac302c20";
var recipientSK = "3bd903fd756a36bf09fc719543bff67b1e67015cad211a24f405884c5d536066";
var senderPK = "826455b754aafd84d08df80c4844f5a1027c7be2c0b791661d130a458a3fc155";
var senderSK = "81a8e5710d44cb3624ced030d0e5e1fb60d055220bd22287655d077a2947d9af";


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
   alert('connected');
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



