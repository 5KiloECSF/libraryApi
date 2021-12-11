const mongoose = require("mongoose");

beforeAll(async () => {
  const mongoUri= "mongodb://localhost/mongoose-api-test";

  mongoose.connect(mongoUri, {
    //
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true,
    useFindAndModify: false,
  useNewUrlParser: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});
