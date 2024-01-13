const { google } = require("googleapis");

// Create label function which creates label to organize auto relaid mails.
const createLabel = async (auth) => {
  // label name.
  const labelName = "Auto Reply On Vacation";
  const gmail = google.gmail({ version: "v1", auth });
  try {
    const response = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    return response.data.id;
    // in case of any error.
  } catch (error) {
    // In case of conflict when we try to create label when exist. || 409
    if (error.code === 409) {
      const response = await gmail.users.labels.list({
        userId: "me",
      });
      const label = response.data.labels.find(
        (label) => label.name === labelName
      );
      return label.id;
    } else {
      throw error;
    }
  }
};
module.exports = { createLabel };
