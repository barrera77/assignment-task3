import axios, { AxiosResponse } from "axios";
import { getEnvironentVariable } from "../utils";
import * as FileSystem from "expo-file-system";

// You can use any hosting service of your preference.
// In this case, we will use ImgBB API: https://api.imgbb.com/.
//
// Sign up for free at https://imgbb.com/signup
// Get your API key and add it to the .env file in your root folder.
//
// To run the app in your local environment, you will need to set the IMGBB_API_KEY
// when starting the app using:
// 'IMGBB_API_KEY="insert_your_api_key_here" npx expo start'
//
// When creating your app build or publishing, do not forget to run 'eas secret:push' command
// to import your secret values to EAS.

const imageApi = axios.create({
  baseURL: "https://api.imgbb.com/1",
  headers: { "Content-Type": "multipart/form-data" },
  params: { key: getEnvironentVariable("IMGBB_API_KEY") },
});

export const uploadImage = async (
  localUri: string
): Promise<{
  url: string;
  size: number;
  name: string;
}> => {
  // Read the local file as base64
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: "base64",
  });

  const form = new FormData();
  form.append("image", base64);

  const response: AxiosResponse = await imageApi.post("/upload", form);
  const json = response.data;

  if (!json?.data?.url) {
    throw new Error("UPLOAD_FAILED");
  }

  return {
    url: json.data.url as string,
    size: Number(json.data.size),
    name: json.data.image?.filename || "photo.jpg",
  };
};
