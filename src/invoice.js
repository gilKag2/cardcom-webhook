import { getVisaIssuancePrice } from "./visaRatesLoader.js";

const createServiceInvoiceLine = (visaPrice) => ({
  Description: "שירות",
  Price: visaPrice.toFixed(2),
  Quantity: 1,
  IsVatFree: "false",
});

const createIssuanceCostInvoiceLine = (productPrice) => ({
  Description: "עלות הנפקה",
  Price: productPrice.toFixed(2),
  Quantity: 1,
  IsVatFree: "true",
});

const createTotalCostInvoiceLine = (productPrice) => ({
  Description: "מחיר כולל שירות",
  Price: productPrice.toFixed(2),
  Quantity: 1,
  IsVatFree: "false",
});

export const createNewInvoiceData = async (data) => {
  if (!data["ProductID"] || !data["ProdPrice"]) {
    throw new Error("Invalid webhook data: missing 'ProductID' or 'ProdPrice'");
  }
  console.log(`Processing data for item ${data["ProductID"]}`);

  let productPrice = +data["ProdPrice"];

  const invoiceLines = [];

  const visaPrice = getVisaIssuancePrice(data["ProductID"]);

  if (visaPrice) {
    console.log("Adding split vat invoice");
    const servicePrice = productPrice - visaPrice;
    invoiceLines.push(createIssuanceCostInvoiceLine(servicePrice));
    invoiceLines.push(createServiceInvoiceLine(visaPrice));
  } else {
    console.log("Adding total cost invoice");
    invoiceLines.push(createTotalCostInvoiceLine(productPrice));
  }

  return {
    terminalnumber: data["terminalnumber"],
    UserName: "kzFKfohEvL6AOF8aMEJz", // Replace with your actual user name
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
      ExtIsVatFree: "false",
    },
    InvoiceLines: invoiceLines,
    "CreditDealNum.DealNumber": data["internaldealnumber"],
  };
};
