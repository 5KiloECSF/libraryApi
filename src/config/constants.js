const log_func=require("../utils/logger")
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, '../../env/app.env') });





const NODE_ENV= process.env.NODE_ENV ||"development"


const PORT= process.env.PORT ||7000

const LOCAL_MONGO_DB_URI= process.env.LOCAL_DB_URI ||"mongodb://localhost:27017/test1"
// remote mongoDb uri
const REMOTE_MONGO_DB_PASSWORD= process.env.REMOTE_MONGO_DB_PASSWORD ||""
const REMOTE_MONGO_DB_USERNAME= process.env.REMOTE_MONGO_DB_USERNAME ||""
const REMOTE_MONGO_DB_NAME= process.env.REMOTE_MONGO_DB_NAME ||""

const REMOTE_MONGO_DB_URI= process.env.REMOTE_MONGO_DB_URI || `mongodb+srv://${REMOTE_MONGO_DB_USERNAME}:${REMOTE_MONGO_DB_PASSWORD}@clustere.eiww7.mongodb.net/${REMOTE_MONGO_DB_NAME}?retryWrites=true&w=majority`
const IsMongoDbRemote=process.env.IS_MONGO_REMOTE==="true"||false
const getMongoUri=()=>{
    if (IsMongoDbRemote){
        log_func("mongoDb is remote", REMOTE_MONGO_DB_URI, "BgCyan")
        return REMOTE_MONGO_DB_URI
    }
    else
        return LOCAL_MONGO_DB_URI
}
const isServerLocal=()=>process.env.IsServerLocal==="true"||true


const JWT_SECRET_KEY= process.env.JWT_SECRET_KEY ||"my_secret_key"
const JWT_EXPIRES_IN= process.env.JWT_EXPIRES_IN || 4000
const JWT_COOKIE_EXPIRES_IN= process.env.JWT_COOKIE_EXPIRES_IN ||4000

const isDevelopment=()=>  process.env.NODE_ENV === "development";
const isProduction=()=>  process.env.NODE_ENV === "production";


let pkey=process.env.FIREBASE_PRIVATE_KEY||""
try{
    // log_func("Original value==", pkey, "yellow")
    let result=pkey.replace(/'/g, '"')
    // log_func("replaced Value", result)
    const privateKey = JSON.parse(result)
    // log_func("json parsed value==-", privateKey, "BgCyan")
    pkey=privateKey.privateKey
}catch (e){
    log_func("error==", e.message, "BgRed")
}
log_func("FirebaseProjectName==>", process.env.FIREBASE_PROJECT_NAME,"BgCyan")
// log_func("private Key===", pkey)
const fbConfig={
    "type": process.env.FIREBASE_TYPE || "",
    "project_id": process.env.FIREBASE_PROJECT_ID ||"",
    "private_key": pkey,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID ||"",
    "client_email": process.env.FIREBASE_CLIENT_EMAIL ||"email@gserviceaccount.com",
    "client_id": process.env.FIREBASE_CLIENT_ID ||"",
    "auth_uri": process.env.FIREBASE_AUTH_URI ||"",
    "token_uri": process.env.FIREBASE_TOKEN_URI ||"",
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||"",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL ||""
}
const FirebaseProjectName=process.env.FIREBASE_PROJECT_NAME
// log_func("pName------", FirebaseProjectName, "BgCyan")
// log_func("mongo------", REMOTE_MONGO_DB_URI, "BgCyan")

exports.PORT=PORT
exports.NODE_ENV=NODE_ENV

exports.fbConfig=fbConfig
exports.FirebaseProjectName=FirebaseProjectName



exports.getMongoUri=getMongoUri
exports.REMOTE_MONGO_DB_URI=REMOTE_MONGO_DB_URI
exports.isServerLocal=isServerLocal
exports.LOCAL_MONGO_DB_URI=LOCAL_MONGO_DB_URI

exports.JWT_EXPIRES_IN=JWT_EXPIRES_IN
exports.JWT_COOKIE_EXPIRES_IN=JWT_COOKIE_EXPIRES_IN
exports.JWT_SECRET_KEY=JWT_SECRET_KEY

exports.isDevelopment=isDevelopment
exports.isProduction=isProduction


