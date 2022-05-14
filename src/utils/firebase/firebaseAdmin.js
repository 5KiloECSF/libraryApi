let admin = require("firebase-admin");
const { v4: uuidv4 } = require('uuid');

const serviceAccount = require("../../../env/aait-a3640-1.json");
const {fbConfig,FirebaseProjectName}=require('../../config/constants');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // credential: admin.credential.cert(fbConfig),
    databaseURL: `https://${FirebaseProjectName}.firebaseio.com`,
    storageBucket: `gs://${FirebaseProjectName}.appspot.com`
});

module.exports=admin;
