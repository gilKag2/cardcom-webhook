import bodyParser from "body-parser";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import { createNewInvoiceData } from "./invoice.js";
import { loadVisasRates } from "./visaRatesLoader.js";
import { buildQueryString, parseResponseData } from "./utils.js";

dotenv.config();

const app = express();

const API_URL = process.env.CARDCOM_SERVICE_API_URL;
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));

// Initial load of commission rates
loadVisasRates();

app.post("/", async (req, res) => {
  if (req.body.responsecode != 0) {
    console.error("Received error response from payment gateway:", req.body.responsdescription);
    return res.status(400).send({ message: "Payment failed in CardCom services" });
  }

  try {
    const newInvoiceData = await createNewInvoiceData(req.body);
    const errorData = await createInvoice(newInvoiceData);
    if (!errorData) {
      res.status(200).send("Webhook received and invoice created successfully");
    } else {
      return res.status(400).send({ message: errorData.message, errorCode: errorData.errorCode });
    }
  } catch (error) {
    res.status(500).send(error.message || "Internal Server Error");
  }
});

const createInvoice = async (invoiceData) => {
  const queryString = buildQueryString(invoiceData);
  const url = `${API_URL}?${queryString}`;
  try {
    const result = await axios.post(url);
    const parsedData = parseResponseData(result.data);
    console.log(parsedData);
    if (parsedData["ResponseCode"] == 0) {
      // success
      return;
    }

    return { errorCode: parsedData["ResponseCode"], message: parsedData["Description"] };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to contact card com services");
  }
};

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
