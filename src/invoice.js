import dotenv from "dotenv";
dotenv.config();

import { getVisaIssuancePrice } from "./visaRatesLoader.js";

const createServiceInvoiceLine = (visaPrice, productId) => ({
  Description: "שירות",
  Price: visaPrice.toFixed(2),
  ProductID: productId,
  Quantity: 1,
  IsVatFree: "false",
});

const createIssuanceCostInvoiceLine = (issuancePrice, productId) => ({
  Description: "עלות הנפקה",
  Price: issuancePrice.toFixed(2),
  ProductID: productId,
  Quantity: 1,
  IsVatFree: "true",
});

const createTotalCostInvoiceLine = (productPrice, productId) => ({
  Description: "מחיר כולל שירות",
  Price: productPrice.toFixed(2),
  ProductID: productId,
  Quantity: 1,
  IsVatFree: "false",
});

export const createNewInvoiceData = async (data) => {
  const productId = data["ProductID"];

  if (!productId || !data["ProdPrice"]) {
    throw new Error("Invalid webhook data: missing 'ProductID' or 'ProdPrice'");
  }
  console.log(`Processing data for item ${productId}`);

  let productPrice = +data["ProdPrice"];

  const invoiceLines = [];

  const visaPrice = getVisaIssuancePrice(productId);

  if (visaPrice) {
    console.log("Adding split vat invoice");
    const servicePrice = productPrice - visaPrice;
    invoiceLines.push(createIssuanceCostInvoiceLine(servicePrice, productId));
    invoiceLines.push(createServiceInvoiceLine(visaPrice, productId));
  } else {
    console.log("Adding total cost invoice");
    invoiceLines.push(createTotalCostInvoiceLine(productPrice, productId));
  }

  return {
    terminalnumber: data["terminalnumber"],
    UserName: "kzFKfohEvL6AOF8aMEJz",
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
