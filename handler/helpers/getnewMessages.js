const { google } = require("googleapis");

//Function which Retrieves new messages from INBOX if that message is unread yet.

const getNewMessages = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    q: "is:unread",
  });
  // returning array of unread messages if found else sending empty array.
  return response.data.messages || [];
};
module.exports = { getNewMessages };
