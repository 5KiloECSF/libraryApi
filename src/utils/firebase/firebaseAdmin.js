let admin = require("firebase-admin");
const { v4: uuidv4 } = require('uuid');
let serviceAccount = require("../../../env/webproj1-a-firebase-adminsdk-rb2ms-03b771f4da.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://webproj1-a.firebaseio.com",
    storageBucket: `gs://webproj1-a.appspot.com`
});

module.exports=admin;
