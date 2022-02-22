const admin = require("./firebaseAdmin")
const {v4: uuidv4} = require("uuid");


const storageRef = admin.storage().bucket(`gs://webproj1-a.appspot.com`);

async function uploadFile(path, filename) {

    // Upload the File
    const storage = await storageRef.upload(path, {
        public: true,
        destination: `/uploads/hashnode/${filename}`,
        metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
        },

    });


    return storage[0].metadata.mediaLink;
}

// (async() => {
//     const url = await uploadFile('./mypic.png', "my-image.png");
//     console.log(url);
// })();