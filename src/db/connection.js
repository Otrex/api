const MongoPaging = require("mongo-cursor-pagination");
const mongoose = require("mongoose");
const config = require("../config");

mongoose.plugin(MongoPaging.mongoosePlugin);

const options = {
  user: config.db.user,
  pass: config.db.password,
  authSource: config.db.authSource,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

const connect = async () => {
  try {
    const db = config.db;
    const uri = `mongodb://${db.host}:${db.port}/${db.database}`;
    await mongoose.connect(uri, options);
    return mongoose.connection;
  } catch (e) {
    process.exit(-1);
  }
};

module.exports = connect;
