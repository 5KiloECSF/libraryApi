const log_func=require("../utils/logger")
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, '../../env/app.env') });

log_func("process==", process.env.FIREBASE_PROJECT_NAME,"BgCyan")

