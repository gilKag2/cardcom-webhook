import dotenv from "dotenv";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
dotenv.config();

let visaPriceMap = new Map();

export const loadVisasRates = async () => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Read the object.
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: "visaRates.json",
      })
    );
    const visasRates = JSON.parse(await Body.transformToString());
    visaPriceMap = new Map(Object.entries(visasRates));
    console.log("visas rates loaded successfully.");
  } catch (error) {
    console.error("Failed to load visas rates:", error);
    // Handle failure to load commission rates
    visaPriceMap = new Map(
      Object.entries({
        1: 20,
        2: 20,
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
