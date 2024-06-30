import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const paymentData = req.body;

    // Log the incoming data for inspection
    console.log("Received payment data:", paymentData);

    // Process the payment data
    const processedData = processPaymentData(paymentData);

    // Send processed data to the original site's payment service API
    await sendToPaymentService(processedData);

    res.send("Webhook received and processed");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});

const processPaymentData = (data) => {
  // TODO: process payment VAT
};

const sendToPaymentService = async (data) => {
  //   const paymentServiceUrl = process.env.PAYMENT_SERVICE_API_URL;
  //   const apiKey = process.env.API_KEY;
  //   try {
  //     const response = await axios.post(paymentServiceUrl, data, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${apiKey}`,
  //       },
  //     });
  //     console.log("Response from payment service:", response.data);
  //   } catch (error) {
  //     console.error("Error sending data to payment service:", error.response?.data || error.message);
  //     throw error;
  //   }
};

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
