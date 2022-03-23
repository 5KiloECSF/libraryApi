
//```````````````````````````````` 1 ----------
// Create a reference to a file object.
// myBucket is the bucket obtained in step 1 above
const file = myBucket.file("directoryName/imageName.png");

// step 2: get ReadableStream from Blob
const stream = blobData.stream();

// step 3: asynchronously pipe/write to file in cloud
async function streamFileUpload() {
    stream.pipe(file.createWriteStream()).on('finish', () => {
        // The file upload is complete
    });
}

streamFileUpload().catch(console.error);


//After this you'll see your file uploaded to Firebase Storage under
// directoryName/imageName.png.

//``````````````````````````````````2 ---------------

// Requiring firebase (as our db)
const firebase = require('firebase');
// Importing our configuration to initialize our app
const config = require('./config');
// Creates and initializes a Firebase app instance. Pass options as param
const db = firebase.initializeApp(config.firebaseConfig);
module.exports = db;

//`````````````````````````````````````````Routes .js
// Requiring firebase (as our db)
const firebase = require('firebase');
// Importing our configuration to initialize our app
const config = require('./config');
// Creates and initializes a Firebase app instance. Pass options as param
const db = firebase.initializeApp(config.firebaseConfig);
module.exports = db;

//`````````````` ````````````````````````    controller.js

// const firebase = require('../db');  // reference to our db
const firestore = firebase.firestore(); // if using firestore
require("firebase/storage"); // must be required for this to work
const storage = firebase.storage().ref(); // create a reference to storage

global.XMLHttpRequest = require("xhr2"); // must be used to avoid bug
const addImage = async (req, res) => {
    try {
        // Grab the file
        const file = req.file;
        // Format the filename
        const timestamp = Date.now();
        const name = file.originalname.split(".")[0];
        const type = file.originalname.split(".")[1];
        const fileName = `${name}_${timestamp}.${type}`;

        // Step 1. Create reference for file name in cloud storage
        const imageRef = storage.child(fileName);
        // Step 2. Upload the file in the bucket storage
        const snapshot = await imageRef.put(file.buffer);
        // Step 3. Grab the public url
        const downloadURL = await snapshot.ref.getDownloadURL();

        res.send(downloadURL);
    }  catch (error) {
        console.log (error)
        res.status(400).send(error.message);
    }
}