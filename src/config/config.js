const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
const log_func = require("../utils/logger");

dotenv.config({ path: path.join(__dirname, '../../env/app.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required().default("development"),
    PORT: Joi.number().default(7000),
    //  mongo
      IS_MONGO_REMOTE:Joi.bool().required().description('check teh database should be remote or not'),
      REMOTE_MONGO_DB_URI:Joi.string().required().description('Mongo DB url for remote database'),
      LOCAL_MONGODB_URL: Joi.string().required().description('Mongo DB url'),
      REMOTE_MONGO_DB_PASSWORD: Joi.string().description('Mongo Dbs password'),
      REMOTE_MONGO_DB_USERNAME: Joi.string().description('Mongo DBs Name'),
      REMOTE_MONGO_DB_NAME: Joi.string().description('Mongo DBs Name'),
    //  Jwt
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),

    //  Firebase
      FIREBASE_TYPE: Joi.string().description('server that will send the emails'),
      FIREBASE_TYPE: Joi.string().description('server that will send the emails'),
      FIREBASE_TYPE: Joi.string().description('server that will send the emails'),
      FIREBASE_TYPE: Joi.string().description('server that will send the emails'),
      FIREBASE_TYPE: Joi.string().description('server that will send the emails'),
      FIREBASE_TYPE: Joi.string().description('server that will send the emails'),

      //  Email
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

let pkey=envVars.FIREBASE_PRIVATE_KEY
try{
    let result=pkey.replace(/'/g, '"')
    const privateKey = JSON.parse(result)
    pkey=privateKey.privateKey
}catch (e){
    log_func("error==", e.message, "BgRed")
}
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
      url:envVars.IS_MONGO_REMOTE==="true" ?envVars.REMOTE_MONGO_DB_URI:envVars.LOCAL_MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
      uri:`mongodb+srv://${envVars.REMOTE_MONGO_DB_USERNAME}:${envVars.REMOTE_MONGO_DB_PASSWORD}@clustere.eiww7.mongodb.net/${envVars.REMOTE_MONGO_DB_NAME + (envVars.NODE_ENV === 'test' ? '-test' : '')}?retryWrites=true&w=majority`,
      isRemote:envVars.IS_MONGO_REMOTE,
      remoteUri:envVars.REMOTE_MONGO_DB_URI,
      options: {
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
    }
  },
    firebase:{
        type: process.env.FIREBASE_TYPE || "",
        project_id: process.env.FIREBASE_PROJECT_ID ||"",
        private_key: pkey,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID ||"",
        client_email: process.env.FIREBASE_CLIENT_EMAIL ||"email@gserviceaccount.com",
        client_id: process.env.FIREBASE_CLIENT_ID ||"",
        auth_uri: process.env.FIREBASE_AUTH_URI ||"",
        token_uri: process.env.FIREBASE_TOKEN_URI ||"",
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||"",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL ||""
    },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
