module.exports = {
  createConnection: require("./connection"),
  models: {
    MailingList: require("./models/MailingList"),
    PhoneVerification: require("./models/PhoneVerification"),
    Account: require("./models/Account"),
    Session: require("./models/Session"),
    Location: require("./models/Location"),
  }
};
