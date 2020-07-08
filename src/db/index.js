module.exports = {
  createConnection: require("./connection"),
  models: {
    MailingList: require("./models/MailingList"),
    PhoneVerification: require("./models/PhoneVerification"),
    Account: require("./models/Account"),
    AccountFollower: require("./models/AccountFollower"),
    Session: require("./models/Session"),
    PasswordReset: require("./models/PasswordReset"),
    Page: require("./models/Page"),
    PageFollower: require("./models/PageFollower"),
    PageTeamMemberInvitation: require("./models/PageTeamMemberInvitation"),
    LocationCategory: require("./models/LocationCategory"),
    Location: require("./models/Location"),
    LocationFollower: require("./models/LocationFollower"),
    LocationAlarm: require("./models/LocationAlarm"),
    Territory: require("./models/Territory"),
    TerritoryTracker: require("./models/TerritoryTracker"),
    PendingUpload: require("./models/PendingUpload"),
    Admin: require("./models/Admin"),
    AdminSession: require("./models/AdminSession"),
    Photo: require("./models/Photo"),
    Event: require("./models/Event"),
    Project: require("./models/Project")
  }
};
