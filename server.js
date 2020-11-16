// IMPORTS
import express from "express";
import mongoose from "mongoose";
import Messages from "./DBMessages.js";
import Pusher from "pusher";
import cors from "cors";

// APP CONFIG
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1107631",
    key: "a92c6d95392ac1fe7af9",
    secret: "bf8ed2ee75583790e935",
    cluster: "eu",
    useTLS: true
});

// MIDDLEWARE
app.use(express.json());
app.use(cors());

//  DB CONFIG
const connectionURL =
  "mongodb+srv://admin:xpFrVnPEZ9uVuYy4@cluster0.eey2u.mongodb.net/whatsappDB?retryWrites=true&w=majority";
mongoose.connect(connectionURL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
    console.log("DB is connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {
        console.log(change);

        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted",
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    received: messageDetails.received
                }
            );
        } else {
            console.log("Error triggering Pusher.");
        }
    });
});

// API ROUTES
app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.get("/messages/sync", (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// LISTENER
app.listen(port, () => console.log("Listening on localhost: " + port));
