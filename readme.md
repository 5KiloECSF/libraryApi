# 5kilo-Fellowship library api 

## Quick Start
To create a project, simply run:

```bash
git clone https://github.com/5kECSF/libraryApi.git
```


## working with remote services
> to work on remote mongodb database 
- set
process.env.IsMongoDbRemote -- to true
process.env.REMOTE_MONGO_DB_URI -- value of the remote db


> to work with firebase, configration locally 
- Add your firebase json file to env folder at the root of your project and 
- give the path in the `src/utils/firebase/firebaseAdmin.js- service account("path_to_json_file.json")`
- then comment out the `credential: admin.credential.cert(fbConfig),`, 
- and uncomment `credential: admin.credential.cert(serviceAccount),`

> to work with firebase remotely 
- comment out `credential: admin.credential.cert(serviceAccount),`
- comment out `const serviceAccount = require("path_to_firebase_config.json");`
- set the properties in each of the keys as env variables on your remote server


> to work with firebase image upload
- set `src/utils/firebase/firebaseImageUploads.js - projName to your firebase project name



## Inspirations

- [lgope/Natours](https://github.com/lgope/Natours.git)
- [hagopj13/node-express-boilerplate](https://github.com/hagopj13/node-express-boilerplate.git)
