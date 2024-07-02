import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import axios from "axios";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  console.log("recieved data:");
  console.log(req.body);

  let newInvoiceData;
  try {
    newInvoiceData = createNewInvoiceData(req.body);
  } catch (err) {
    return res.status(404).send({ message: err.message });
  }
  try {
    await createInvoice(newInvoiceData);

    res.status(200).send("Webhook received and invoice created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || "Internal Server Error");
  }
});

const conversionMap = new Map();

conversionMap.set("1", 24);
conversionMap.set("2", 24);

const createNewInvoiceData = (data) => {
  if (!data["ProdItemID"] || !data["ProdPrice"]) {
    throw new Error("Invalid webhook data: missing 'ProdItemID' or 'ProdPrice'");
  }
  console.log(`processing data for item ${data["ProdItemID"]}`);

  let productPrice = +data["ProdPrice"];

  const invoiceLines = [];

  if (conversionMap.has(data["ProdItemID"])) {
    const commissionPrice = conversionMap.get(data["ProdItemID"]);
    invoiceLines.push({ Description: "Comission", Price: commissionPrice.toFixed(2), Quantity: 1, IsVatFree: "false" });
    productPrice -= commissionPrice;
  }

  invoiceLines.push({ Description: "Product", Price: productPrice.toFixed(2), Quantity: 1, IsVatFree: "true" });

  // Create the new invoice
  const invoiceData = {
    terminalnumber: data["terminalnumber"],
    UserName: "kzFKfohEvL6AOF8aMEJz",
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
    InvoiceLines: invoiceLines,
    "CreditDealNum.DealNumber": data["internaldealnumber"],
  };

  return invoiceData;
};

const createInvoice = async (invoiceData) => {
  const queryString = buildQueryString(invoiceData);
  const url = `https://secure.cardcom.co.il/Interface/CreateInvoice.aspx?${queryString}`;
  try {
    const result = await axios.post(url);
    const parsedData = parseResponseData(result.data);
    const { ResponseCode, Description } = parsedData;
    if (ResponseCode !== 0) {
      console.log(result.data);
      throw new Error("Failed to create invoice");
    }
  } catch (err) {
    console.log(err);
    throw new Error("Failed to contact card com services");
  }
};

const buildQueryString = (data) => {
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
};

const parseResponseData = (responseData) => {
  const params = new URLSearchParams(responseData);
  const parsedData = {};
  for (const [key, value] of params) {
    parsedData[key] = value;
  }
  return parsedData;
};

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
