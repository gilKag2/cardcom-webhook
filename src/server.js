import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import { visaVatConversionMap } from "./vatConversionMap";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  console.log(req.params);

  const webhookData = {};

  const params = req.params.split("&");

  params.forEach((param) => {
    const [key, value] = param.split("=");
    webhookData[key] = value;
  });
  console.log("webhook data");
  console.log(webhookData);

  try {
    // const transformedData = processPaymentData(webhookData);
    await createInvoice(transformedData);

    res.status(200).send("Webhook received and invoice created successfully");
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});

const processPaymentData = (data) => {
  console.log("item ", data["ProdItemID"]);
  // const vatData = visaVatConversionMap(data.ProdName); // maps product name to vat pricing information
  // TODO: process payment VAT
};

const createInvoice = async (invoiceData) => {
  console.log("creating new invoice ");
  const newInvoice = { terminalnumber: invoiceData["terminalnumber"] };
  console.log(newInvoice);
  // try {
  //   const response = await axios.post("https://secure.cardcom.co.il/Interface/CreateInvoice.aspx", qs.stringify(invoiceData), {
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //   });

  //   const result = qs.parse(response.data);

  //   if (result.ResponseCode === "0") {
  //     console.log(`Invoice Number: ${result.InvoiceNumber} Invoice Type: ${result.InvoiceType}`);
  //   } else {
  //     console.error("Error:", result);
  //   }
  // } catch (error) {
  //   console.error("Error:", error);
  // }
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
