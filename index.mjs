import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createInvoice } from "./src/invoice.js";
import dotenv from "dotenv";
import querystring from "querystring";
dotenv.config();

const s3Client = new S3Client();

const loadVisasRates = async () => {
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: "visaRates.json",
    })
  );
  const visasRates = JSON.parse(await Body.transformToString());
  return visasRates;
};

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2)); // Log the entire event

  // Parsing the URL-encoded body
  let body;
  try {
    body = querystring.parse(event["body-json"]);
  } catch (err) {
    console.error("Error parsing body:", err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid form data format" }),
    };
  }

  try {
    const visaRates = await loadVisasRates();
    console.log(visaRates);
    const errorData = await createInvoice(body, visaRates);
    if (!errorData) {
      return {
        statusCode: 200,
        body: JSON.stringify("Webhook received and invoice created successfully"),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: errorData.message, errorCode: errorData.errorCode }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message || "Internal Server Error"),
    };
  }
};
