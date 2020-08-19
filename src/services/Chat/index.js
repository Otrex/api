const {
  ServiceError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const libPhoneNumber = require("google-libphonenumber");
const PNF = libPhoneNumber.PhoneNumberFormat;
const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();

const utils = require("../../utils");
const pick = require("lodash/pick");

const db = require("../../db");
const models = db.models;

/*
* Validation Helpers
* */
const { string, any, objectId } = require("../../validation");

/*
* Service Dependencies
* */
const WebsocketService = require("../Websocket");

/*
* Service Actions
* */
module.exports.getContacts = wrapServiceAction({
  params: {
    accountId: { ...objectId }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    return models.Contact.aggregate([
      {
        $match: {
          accountId: db.utils.ObjectId(params.accountId),
          isBlocked: false
        }
      },
      {
        $lookup: {
          from: models.Account.collection.collectionName,
          localField: "contactId",
          foreignField: "_id",
          as: "account",
        }
      },
      {
        $set: {
          account: { $arrayElemAt: ["$account", 0] }
        }
      },
      {
        $project: {
          "isBlocked": 1,
          "account.username": 1,
          "account.phoneNumber": 1,
          "account.profileImage": 1
        }
      }
    ]);
  }
});

module.exports.populateContacts = wrapServiceAction({
  params: {
    accountId: { ...objectId },
    phoneNumbers: {
      type: "array",
      items: {
        ...string,
        min: 9
      }
    }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const defaultCountryCode = account.countryCode;
    for (const phoneNumber of params.phoneNumbers) {
      const isInternationalFormat = phoneNumber.includes("+");
      const parseCountryCode = isInternationalFormat ? undefined : defaultCountryCode;
      const parsedPhoneNumber = phoneUtil.parseAndKeepRawInput(phoneNumber, parseCountryCode);
      if (!phoneUtil.isPossibleNumber(parsedPhoneNumber) || !phoneUtil.isValidNumber(parsedPhoneNumber)) {
        continue;
      }
      const formattedPhoneNumber = phoneUtil.format(parsedPhoneNumber, PNF.E164);
      const pointographAccount = await models.Account.findOne({
        phoneNumber: formattedPhoneNumber,
        _id: { $ne: account._id }
      });
      if (!pointographAccount) {
        continue;
      }
      const exists = await models.Contact.findOne({
        accountId: params.accountId,
        contactId: pointographAccount._id
      });
      if (!exists) {
        await models.Contact.create({
          accountId: params.accountId,
          contactId: pointographAccount._id
        });
        // create conversation between contact if not exists
        const conversation = await models.Conversation.findOne({
          members: { $all: [pointographAccount._id, account._id] }
        });
        if (!conversation) {
          await models.Conversation.create({
            initiatedBy: account._id,
            members: [account._id, pointographAccount._id]
          });
        }
      }
    }
    return await module.exports.getContacts({
      accountId: params.accountId
    });
  }
});

module.exports.blockContact = wrapServiceAction({
  params: {
    accountId: { ...objectId },
    contactId: { ...objectId }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const contact = await models.Contact.findOne({
      _id: params.contactId,
      accountId: params.accountId
    });
    if (!contact) {
      throw new ServiceError("contact not found");
    }
    if (contact.isBlocked) {
      throw new ServiceError("you have already blocked this contact");
    }
    contact.isBlocked = true;
    await contact.save();
    return true;
  }
});

module.exports.unblockContact = wrapServiceAction({
  params: {
    accountId: { ...objectId },
    contactId: { ...objectId }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const contact = await models.Contact.findOne({
      _id: params.contactId,
      accountId: params.accountId
    });
    if (!contact) {
      throw new ServiceError("contact not found");
    }
    if (!contact.isBlocked) {
      throw new ServiceError("contact is not blocked");
    }
    contact.isBlocked = false;
    await contact.save();
    return true;
  }
});

module.exports.createConversation = wrapServiceAction({
  params: {
    initiatedBy: { ...objectId },
    members: {
      type: "array",
      items: { ...objectId }
    }
  },
  async handler (params) {
    const account = await models.Account.findById(params.initiatedBy);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const members = [params.initiatedBy];
    for (const member of params.members) {
      const contact = await models.Contact.findOne({
        contactId: member,
        accountId: params.initiatedBy
      });
      if (!contact) {
        throw new ServiceError("contact not found");
      }
      members.push(contact.contactId);
    }
    params.members = Array.from(new Set(members));
    return await models.Conversation.create({
      ...params
    });
  }
});

module.exports.getConversations = wrapServiceAction({
  params: {
    accountId: { ...objectId }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    return models.Conversation.aggregate([
      {
        $match: {
          members: db.utils.ObjectId(params.accountId)
        }
      },
      {
        $set: {
          members: {
            $filter: {
              input: "$members",
              as: "member",
              cond: { $ne: ["$$member", db.utils.ObjectId(params.accountId)] }
            }
          }
        }
      },
      {
        $lookup: {
          from: models.Account.collection.collectionName,
          let: { members: "$members" },
          pipeline: [
            {
              $match: {
                $expr:
                  {
                    $and: [
                      { $in: ["$_id", "$$members"] }
                    ]
                  }
              }
            },
            {
              $project: {
                username: 1,
                profileImage: 1,
                phoneNumber: 1
              }
            }
          ],
          as: "members"
        }
      },
      {
        $lookup: {
          from: models.ConversationMessage.collection.collectionName,
          let: { conversationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr:
                  {
                    $and: [
                      { $eq: ["$$conversationId", "$conversationId"] }
                    ]
                  }
              }
            },
            { $sort: { "_id": -1 } },
            { $limit: 1 },
            {
              $project: {
                deletedBy: 0
              }
            }
          ],
          as: "lastMessages"
        }
      },
      {
        $project: {
          members: 1,
          lastMessages: 1
        }
      }
    ]);
  }
});

module.exports.postConversationMessage = wrapServiceAction({
  params: {
    accountId: { ...objectId },
    conversationId: { ...objectId },
    type: {
      type: "enum",
      values: ["text", "photo", "video", "audio", "location"]
    },
    content: { ...string }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const conversation = await models.Conversation.findById(params.conversationId);
    if (!conversation) {
      throw new ServiceError("conversation not found");
    }
    const isMember = conversation.members.find(m => m.toString() === account._id.toString());
    if (!isMember) {
      throw new ServiceError("conversation not found ;)");
    }
    await models.ConversationMessage.create({
      conversationId: params.conversationId,
      senderId: params.accountId,
      type: params.type,
      content: params.content
    });
    const otherMembers = conversation.members.filter(m => m.toString() !== account._id.toString());
    for (const member of otherMembers) {
      const connection = await models.WebSocketConnection.findOne({
        accountId: member
      });
      if (connection) {
        // get messages
        const messages = await models.ConversationMessage.aggregate([
          {
            $match: {
              conversationId: conversation._id
            }
          },
          {
            $lookup: {
              from: models.Account.collection.collectionName,
              localField: "senderId",
              foreignField: "_id",
              as: "sender",
            }
          },
          {
            $set: {
              sender: { $arrayElemAt: ["$sender", 0] }
            }
          },
          {
            $project: {
              "isForwarded": 1,
              "conversationId": 1,
              "senderId": 1,
              "sender.username": 1,
              "sender.profileImage": 1,
              "type": 1,
              "content": 1,
              "createdAt": 1
            }
          }
        ]);
        await WebsocketService.emitChatNotification({
          socketId: connection.socketId,
          event: "conversation.messages.new",
          payload: {
            conversation: {
              ...conversation.toObject(),
              messages
            },
          }
        });
        await WebsocketService.emitChatNotification({
          socketId: connection.socketId,
          event: "new_message",
          payload: {
            conversation: {
              ...conversation.toObject(),
              messages
            },
          }
        });
      }
    }
    return true;
  }
});

module.exports.getConversationMessages = wrapServiceAction({
  params: {
    accountId: { ...objectId },
    conversationId: { ...objectId }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const conversation = await models.Conversation.findById(params.conversationId);
    if (!conversation) {
      throw new ServiceError("conversation not found");
    }
    // check if account is a member of the conversation
    const isMember = conversation.members.find(m => m.toString() === account._id.toString());
    if (!isMember) {
      throw new ServiceError("conversation not found ;)");
    }

    // get messages
    return models.ConversationMessage.aggregate([
      {
        $match: {
          conversationId: conversation._id
        }
      },
      {
        $lookup: {
          from: models.Account.collection.collectionName,
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        }
      },
      {
        $set: {
          sender: { $arrayElemAt: ["$sender", 0] }
        }
      },
      {
        $project: {
          "isForwarded": 1,
          "conversationId": 1,
          "senderId": 1,
          "sender.username": 1,
          "sender.profileImage": 1,
          "type": 1,
          "content": 1,
          "createdAt": 1
        }
      }
    ]);
  }
});

module.exports.forwardConversationMessage = wrapServiceAction({
  params: {
    accountId: { ...objectId },
    sourceConversationId: { ...objectId },
    destinationConversationId: { ...objectId },
    messageId: { ...objectId }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const sourceConversation = await models.Conversation.findById(params.sourceConversationId);
    if (!sourceConversation) {
      throw new ServiceError("conversation not found");
    }
    const isSourceConversationMember = sourceConversation.members.find(m => m.toString() === account._id.toString());
    if (!isSourceConversationMember) {
      throw new ServiceError("conversation not found ;)");
    }
    const destinationConversation = await models.Conversation.findById(params.destinationConversationId);
    if (!destinationConversation) {
      throw new ServiceError("conversation not found");
    }
    const message = await models.ConversationMessage.findOne({
      _id: params.messageId,
      conversationId: params.sourceConversationId
    });
    if (!message) {
      throw new ServiceError("message not found");
    }
    const isDestinationConversationMember = destinationConversation.members.find(m => m.toString() === account._id.toString());
    if (!isDestinationConversationMember) {
      throw new ServiceError("conversation not found ;)");
    }
    await models.ConversationMessage.create({
      conversationId: params.destinationConversationId,
      senderId: params.accountId,
      type: message.type,
      content: message.content,
      isForwarded: true
    });
    return true;
  }
});

module.exports.deleteConversationMessage = wrapServiceAction({
  params: {
    accountId: { ...objectId },
    conversationId: { ...objectId },
    messageId: { ...objectId }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const conversation = await models.Conversation.findById(params.conversationId);
    if (!conversation) {
      throw new ServiceError("conversation not found");
    }
    const isMember = conversation.members.find(m => m.toString() === account._id.toString());
    if (!isMember) {
      throw new ServiceError("conversation not found ;)");
    }
    const message = await models.ConversationMessage.findOne({
      _id: params.messageId,
      conversationId: params.conversationId
    });
    if (!message) {
      throw new ServiceError("message not found");
    }
    const isDeleted = message.deletedBy.find(d => d.toString() === account._id.toString());
    if (isDeleted) {
      throw new ServiceError("message not found ;)");
    }
    message.deletedBy.push(account._id);
    await message.save();
    return true;
  }
});

module.exports.deleteConversation = wrapServiceAction({
  params: {
    accountId: { ...objectId },
    conversationId: { ...objectId }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const conversation = await models.Conversation.findById(params.conversationId);
    if (!conversation) {
      throw new ServiceError("conversation not found");
    }
    const isMember = conversation.members.find(m => m.toString() === account._id.toString());
    if (!isMember) {
      throw new ServiceError("conversation not found ;)");
    }
    await models.ConversationMessage.updateMany({
      conversationId: params.conversationId
    }, { $addToSet: { deletedBy: account._id } });
    return true;
  }
});
