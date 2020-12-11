const events = require("./events");

const commonFields = {
  from_name: "Pointograph",
  from_email: "no-reply@pointograph.com"
};

module.exports = {
  [events.USER_REGISTERED]: {
    ...commonFields,
    subject: "Welcome",
    body: `
      <p>Hello </p>
      <p>Thank you for registering</p>
      <p>Welcome {{ first_name }},</p>
      <p>You have successfully created a {{ platform.name }} account with details:</p>
      <p>Email: {{ email }}</p>
<!--      <p>Confirm your email by clicking this link <a href="{{ link }}">{{ link }}</a></p>-->
    `
  },
  [events.PASSWORD_RESET_REQUESTED]: {
    ...commonFields,
    subject: "Reset your password",
    body: `
      <h3>Hello</h3>
      <p>You have requested to reset your password</p>
      <p>Click this link to reset your password <a href="{{ link }}">{{ link }}</a></p>
      <p>Link expires after 1 hour.</p>
    `
  },
  [events.PASSWORD_RESET_SUCCESSFUL]: {
    ...commonFields,
    subject: "Password reset successful",
    body: `
      <h3>Hello {{ first_name }},</h3>
      <p>You have successfully reset your password.</p>
    `
  },
  [events.PAGE_TEAM_MEMBER_INVITED]: {
    ...commonFields,
    subject: "Page Invite",
    body: `
      <h3>Hello</h3>
      <p>You have been invited to manage <strong>{{ page.name }}</strong> page on pointograph.</p>
      <p>Click this link to accept <a href="{{ link }}">{{ link }}</a></p>
    `
  }
};
