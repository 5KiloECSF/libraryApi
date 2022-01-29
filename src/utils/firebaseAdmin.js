let admin = require("firebase-admin");

let serviceAccount = require("../constants/webproj1-a-firebase-adminsdk-rb2ms-03b771f4da.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://webproj1-a.firebaseio.com"
});
const storageRef = admin.storage().bucket(`gs://webproj1-a.appspot.com`);

module.exports=admin;