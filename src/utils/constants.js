const NODE_ENV= process.env.NODE_ENV ||"development"
const LOCAL_DB_URI= process.env.LOCAL_DB_URI ||""
const REMOTE_DB_URI= process.env.REMOTE_DB_URI ||""
const DB_PASSWORD= process.env.DB_PASSWORD ||""

const PORT= process.env.PORT ||4000

const JWT_SECRET_KEY= process.env.JWT_SECRET_KEY ||"my_secret_key"
const JWT_EXPIRES_IN= process.env.JWT_EXPIRES_IN || 4000
const JWT_COOKIE_EXPIRES_IN= process.env.JWT_COOKIE_EXPIRES_IN ||4000

const isDevelopment=()=>  process.env.NODE_ENV === "development";
const isProduction=()=>  process.env.NODE_ENV === "production";



exports.PORT=PORT
exports.LOCAL_DB_URI=LOCAL_DB_URI
exports.NODE_ENV=NODE_ENV

exports.JWT_EXPIRES_IN=JWT_EXPIRES_IN
exports.JWT_COOKIE_EXPIRES_IN=JWT_COOKIE_EXPIRES_IN
exports.JWT_SECRET_KEY=JWT_SECRET_KEY

exports.isDevelopment=isDevelopment
exports.isProduction=isProduction


