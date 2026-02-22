/* global process */
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});

import app from "./app.js";
import {connectDb} from './db/connectDb.js';

const PORT = process.env.PORT;

connectDb()
.then(() => {
    app.listen(PORT, () => {
        console.log(`server is running on port with the successful connection to the database ${PORT}`)
    })
}) .catch((err) => {
    console.log("error in connecting to the database", err);
})

