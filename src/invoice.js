import { buildQueryString, parseResponseData } from "./utils.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_URL = process.env.CARDCOM_SERVICE_API_URL;
const USERNAME = process.env.USERNAME;

const createServiceInvoiceLine = (visaPrice, productId) => ({
  Description: "עלות תפעול",
  Price: visaPrice.toFixed(2),
  ProductID: productId,
  Quantity: 1,
  IsVatFree: "false",
});

const createIssuanceCostInvoiceLine = (issuancePrice, productId) => ({
  Description: "עלות מערכת",
  Price: issuancePrice.toFixed(2),
  ProductID: productId,
  Quantity: 1,
  IsVatFree: "true",
});

const createTotalCostInvoiceLine = (productPrice, productId) => ({
  Description: "עלות מערכת ותפעול",
  Price: productPrice.toFixed(2),
  ProductID: productId,
  Quantity: 1,
  IsVatFree: "false",
});

const createNewInvoiceData = (data, visaRates) => {
  const productId = data["ProductID"];

  if (!productId || !data["ProdPrice"]) {
    throw new Error("Invalid webhook data: missing 'ProductID' or 'ProdPrice'");
  }
  console.log(`Processing data for item ${productId}`);

  const quantity = data["ProdQuantity"];

  let productPrice = +data["ProdPrice"] * quantity;

  const invoiceLines = [];

  const visaPrice = visaRates[productId] * quantity;

  if (visaPrice) {
    console.log("Adding split vat invoice");
    const servicePrice = productPrice - visaPrice;
    invoiceLines.push(createIssuanceCostInvoiceLine(visaPrice, productId));
    invoiceLines.push(createServiceInvoiceLine(servicePrice, productId));
  } else {
    console.log("Adding total cost invoice");
    invoiceLines.push(createTotalCostInvoiceLine(productPrice, productId));
  }

  return {
    terminalnumber: data["terminalnumber"],
    UserName: USERNAME,
    InvoiceType: "1",
    InvoiceHead: {
      CustName: data["CardOwnerName"] || "",
      CustAddresLine1: data["InvAddress"] || "",
      CustAddresLine2: data["InvAddress2"] || "",
      CustCity: data["intCity"] || "",
      CustLinePH: data["InvPhone"] || "",
      CustMobilePH: data["InvMobile"] || "",
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
};

export const createInvoice = async (data, visaRates) => {
  const invoiceData = createNewInvoiceData(data, visaRates);
  console.log("invoice data: ", invoiceData);
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
