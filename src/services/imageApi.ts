import axios, { AxiosResponse } from "axios";
import { getEnvironentVariable } from "../utils";

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
  base64String: string
): Promise<{
  url: string;
  size: number;
  name: string;
}> => {
  // The base64 string is now passed in directly from the caller
  const form = new FormData();
  form.append("image", base64String);

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
