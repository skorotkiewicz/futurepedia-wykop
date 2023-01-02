import * as dotenv from "dotenv";
dotenv.config();
import { wykopRequest } from "sign-api-wykop";
import md5 from "md5";

const url = "http://localhost/aaa";
const urlBase = Buffer.from(url).toString("base64");
console.log(encodeURI(urlBase));

wykopRequest(
  `Login/Connect/appkey/${process.env.APPKEY}/secure/${md5(
    process.env.SECRET + url
  )}/redirect/${urlBase}`,
  {},

  process.env.APPKEY,
  process.env.SECRET
)
  .then((res) => {
    console.log(res.config.url);
  })
  .catch((error) => {
    throw error;
  });
