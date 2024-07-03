import fs from "fs";

let visaPriceMap = new Map();

export const loadVisasRates = () => {
  try {
    const rawData = fs.readFileSync("visa-rates.json");
    const visasRates = JSON.parse(rawData);
    visaPriceMap = new Map(Object.entries(visasRates));
    console.log("visas rates loaded successfully.");
  } catch (error) {
    console.error("Failed to load visas rates:", error);
    // Handle failure to load commission rates
    visaPriceMap = new Map(
      Object.entries({
        1: 24,
        2: 24,
        11: 100,
        12: 160,
        13: 310,
        21: 200,
        22: 200,
        23: 400,
        31: 200,
        32: 200,
        33: 400,
      })
    );
  }
};

export const getVisaIssuancePrice = (productId) => {
  console.log(`getting visa issuance price for product with id ${productId}`);
  return visaPriceMap.get(productId);
};
