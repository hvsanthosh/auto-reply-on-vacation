// Packages used.
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs").promises;
// importing helper functions (helps to get new message, and create label)
const { getNewMessages } = require("./helpers/getnewMessages.js");
const { createLabel } = require("./helpers/createlabelHelper.js");

// Scopes used and required for this app.
// 1) Manage mails,
// 2) Send mail, and
// 3) Manage label.
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

// Route handler for ROOT path || GET
const rootHandler = async (req, res) => {
  // Authenticate user using gmail id and client credentials.
  //   Asynchronous function which authenticates user.
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "client_secret.json"),
    scopes: SCOPES,
  });

  //after successfully authentication we will receive authorized gmail.
  const gmail = google.gmail({ version: "v1", auth });

  // MAIN function which performs all tasks asynchronously.
  const autoMessageOnVacation = async () => {
    // Function which creates label to organize unread messages, and reply automatically.
    // I'm call createLabel() function and passing auth.
    const labelId = await createLabel(auth);

    // Repeat the block of code in intervals (repeat all 3 steps).
    setInterval(async () => {
      // function which retrieves unread messages from the MAIL box.
      const messages = await getNewMessages(auth);

      // This block gets executed if there are new messages, and sends the appropriate replay to the users.
      if (messages && messages.length > 0) {
        console.log("new message exist.");
        // Iterate over all messages one by one.
        for (const message of messages) {
          const messageData = await gmail.users.messages.get({
            auth,
            userId: "me",
            id: message.id,
          });

          const email = messageData.data;
          // checking replied or not.
          const hasReplied = email.payload.headers.some(
            (header) => header.name === "In-Reply-To"
          );
          // if mail is not replied yet then this block of code executes.
          if (!hasReplied) {
            console.log("Auto replying....");
            const replyMessage = {
              userId: "me",
              resource: {
                raw: Buffer.from(
                  `To: ${
                    email.payload.headers.find(
                      (header) => header.name === "From"
                    ).value
                  }\r\n` +
                    `Subject: Re: ${
                      email.payload.headers.find(
                        (header) => header.name === "Subject"
                      ).value
                    }\r\n` +
                    `Content-Type: text/plain; charset="UTF-8"\r\n` +
                    `Content-Transfer-Encoding: 7bit\r\n\r\n` +
                    `Hey there, Thankyou for this mail. I'm away currently, I will get back to you asap.\r\n`
                ).toString("base64"),
              },
            };
            // reply to the new mail.
            await gmail.users.messages.send(replyMessage);

            // add label to the mail and move that mail under that label created.
            await gmail.users.messages.modify({
              auth,
              userId: "me",
              id: message.id,
              resource: {
                addLabelIds: [labelId],
                removeLabelIds: ["INBOX"],
              },
            });
            console.log("message replied");
          }
        }
      }
    }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);
  };

  // calling the main function.
  autoMessageOnVacation();
  // res.json({ "this is Auth": auth });
};

module.exports = { rootHandler };
