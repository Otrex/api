module.exports = {
  createConnection: require("./connection"),
  models: {
    MailingList: require("./models/MailingList"),
    PhoneVerification: require("./models/PhoneVerification"),
    Account: require("./models/Account"),
    Session: require("./models/Session"),
    Location: require("./models/Location"),
    LocationCategory: require("./models/LocationCategory"),
    AccountFollower: require("./models/AccountFollower"),
    Page: require("./models/Page"),
    PageFollower: require("./models/PageFollower"),
    PasswordReset: require("./models/PasswordReset"),
    Territory: require("./models/Territory"),
    TerritoryTracker: require("./models/TerritoryTracker"),
    PendingUpload: require("./models/PendingUpload"),
    Admin: require("./models/Admin"),
    AdminSession: require("./models/AdminSession"),
    Photo: require("./models/Photo")
  }
};
