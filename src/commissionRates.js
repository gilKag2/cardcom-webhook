// commissionRates.js

import fs from "fs";

let commissionPerItemPriceMap = new Map();

export const loadCommissionRates = () => {
  try {
    const rawData = fs.readFileSync("commission-rates.json");
    const commissionRates = JSON.parse(rawData);
    commissionPerItemPriceMap = new Map(Object.entries(commissionRates));
    console.log("Commission rates loaded successfully.");
  } catch (error) {
    console.error("Failed to load commission rates:", error);
    // Handle failure to load commission rates
    commissionPerItemPriceMap = new Map(
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

export const getCommissionPrice = (productId) => {
  console.log(`getting commission price for product with id ${productId}`);
  return commissionPerItemPriceMap.get(productId);
};
