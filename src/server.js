import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
// app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));

const conversionMap = new Map();

conversionMap.set("1", 50);
conversionMap.set("2", 50);

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  console.log("recieved data:");
  console.log(req.body);

  try {
    processData(req.body);
    // const transformedData = processPaymentData(webhookData);
    // await createInvoice(webhookData);

    res.status(200).send("Webhook received and invoice created successfully");
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});

const processData = (data) => {
  console.log(`processing data for item ${data["ProdItemID"]}`);
  const priceWithoutVat = conversionMap.get(data["ProdItemID"]); // maps product name to vat pricing information
  if (!visaPrice) {
    return;
  }
  const priceWithVat = +data["ProdPrice"] - priceWithoutVat;
  console.log("prices:");
  console.log(priceWithVat, priceWithoutVat);
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
