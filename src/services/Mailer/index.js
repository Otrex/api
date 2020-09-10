const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const utils = require("../../utils");

/*
* Validation Helpers
* */
const { string } = require("../../validation");

/*
* Service Dependencies
* */


/*
* Service Actions
* */
module.exports.action = wrapServiceAction({
  params: {
    field: { ...string }
  },
  async handler(params) {
    return params;
  }
});

const events = require("./events");
const defaultTemplates = require("./defaultTemplates");
const renderTemplate = utils.renderTemplate;

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const masterTemplate = () => {
  return `
  <div style="background-color: #edeef2; padding: 2.25rem 2rem;">
    <div style="padding: 2.25rem 2rem; background-color: #fff; margin: 0 auto; max-width: 768px; min-width:300px;">
      {{{ content }}}
    </div>
    <div style="text-align:center;">
      <p style="margin-bottom: 0; margin-top:32px;">
        <span style="display: inline-block; margin-right: 8px;">Pointograph</span>
      </p>
    </div>
  </div>
  `;
};

const getTemplate = async (event) => {
  return defaultTemplates[event];
};

const getRenderedTemplate = async (event, context = {}) => {
  if (!Object.values(events).includes(event)) {
    throw new Error("event not found");
  }
  const template = await getTemplate(event);
  return {
    ...template,
    from_name: renderTemplate(template.from_name, context),
    from_email: renderTemplate(template.from_email, context),
    subject: renderTemplate(template.subject, context),
    body: renderTemplate(template.body, context)
  };
};

const send = async (event, email, context = {}, sendgridOptions = {}) => {
  if (!Object.values(events).includes(event)) {
    throw new Error("event not found");
  }
  const template = await getRenderedTemplate(event, context);
  const msg = {
    to: email,
    from: {
      email: template.from_email,
      name: template.from_name,
    },
    subject: template.subject,
    html: renderTemplate(masterTemplate(), {
      content: template.body
    }),
    ...sendgridOptions
  };
  // return await sgMail.send(msg);
  return true;
};

module.exports = {
  events: events,
  send: send,
  getRenderedTemplate: getRenderedTemplate
};

