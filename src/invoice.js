import { getCommissionPrice } from "./commissionRates.js";

export const createNewInvoiceData = async (data) => {
  if (!data["ProductID"] || !data["ProdPrice"]) {
    throw new Error("Invalid webhook data: missing 'ProductID' or 'ProdPrice'");
  }
  console.log(`Processing data for item ${data["ProductID"]}`);

  let productPrice = +data["ProdPrice"];

  const invoiceLines = [];

  const commissionPriceNIS = getCommissionPrice(data["ProductID"]);

  if (commissionPriceNIS) {
    console.log("Adding split commission invoice");

    invoiceLines.push({
      Description: "שירות",
      Price: commissionPriceNIS.toFixed(2),
      Quantity: 1,
      IsVatFree: "true",
    });

    productPrice -= commissionPriceNIS;
  }

  invoiceLines.push({
    Description: "עלות הנפקה",
    Price: productPrice.toFixed(2),
    Quantity: 1,
    IsVatFree: "false",
  });

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
