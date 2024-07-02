import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import axios from "axios";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));

const conversionMap = new Map();

conversionMap.set("1", 50);
conversionMap.set("2", 50);

app.post("/", async (req, res) => {
  try {
    const newInvoiceData = processData(req.body);
    await createInvoice(newInvoiceData);

    res.status(200).send("Webhook received and invoice created successfully");
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});

const processData = (data) => {
  console.log(`processing data for item ${data["ProdItemID"]}`);
  const commissionPrice = conversionMap.get(data["ProdItemID"]); // maps product name to vat pricing information
  if (!commissionPrice) {
    console.log("Product ID not found in conversion map.");
    return;
  }
  const productPrice = +data["ProdPrice"] - commissionPrice;

  // Create the new invoice
  const invoiceData = {
    terminalnumber: data["terminalnumber"],
    UserName: "test9611",
    InvoiceType: "1",
    InvoiceHead: {
      CustName: data["CardOwnerName"],
      CustAddresLine1: data["InvAddress"],
      CustAddresLine2: data["InvAddress2"],
      CustCity: data["intCity"],
      CustLinePH: data["InvPhone"],
      CustMobilePH: data["InvMobile"],
      CompID: data["UID"],
      Language: "he",
      Comments: "Thanks for buying",
      CoinID: "1",
      Email: data["UserEmail"],
      SendByEmail: "true",
    },
    InvoiceLines: [
      { Description: "Product", Price: commissionPrice.toFixed(2), Quantity: 1, IsVatFree: "true" },
      { Description: "Comission", Price: productPrice.toFixed(2), Quantity: 1, IsVatFree: "false" },
    ],
    "CreditDealNum.DealNumber": data["internaldealnumber"],
  };

  return invoiceData;
};

function buildQueryString(data) {
  const params = new URLSearchParams();

  for (const key in data) {
    if (typeof data[key] === "object" && !Array.isArray(data[key])) {
      for (const subKey in data[key]) {
        params.append(`${key}.${subKey}`, data[key][subKey]);
      }
    } else if (Array.isArray(data[key])) {
      data[key].forEach((item, index) => {
        for (const subKey in item) {
          params.append(`${key}${index + 1}.${subKey}`, item[subKey]);
        }
      });
    } else {
      params.append(key, data[key]);
    }
  }

  return params.toString();
}

const createInvoice = async (invoiceData) => {
  const queryString = buildQueryString(invoiceData);
  const url = `https://secure.cardcom.co.il/Interface/CreateInvoice.aspx?${queryString}`;

  console.log(url);

  try {
    const result = await axios.post(url);

    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
