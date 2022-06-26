import { Web3Storage, File, getFilesFromPath } from "web3.storage";
const { join, resolve } = require("path");

export default async function handler(req, res) {
  console.log("HANDLING")
  if (req.method === "POST") {
    console.log("POST REQ")
    return await storeEventData(req, res);
  } else {
    return res
      .status(405)
      .json({ message: "Method not allowed", success: false });
  }
}

async function storeEventData(req, res) {

  const fileBlob = [
    new File(['contents-of-file-1'], 'plain-utf8.txt'),
    new File([req.body], "myNewFile")
  ]

  // console.log("FILES", fileBlob.stream)
  try {
    const cid = await storeFiles(fileBlob);
    console.log("stored files with cid:", cid);
    return res.status(200).json({ success: true, cid: cid });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error storing the file", success: false });
  }
}

async function storeFiles(files) {
  console.log("TRYING TO STORE")
  const client = makeStorageClient();
  console.log("CLIENT PUT")
  try {
    const cid = await client.put(files);
    return cid;
  } catch (error) {
    console.log("ERROR", error)
  }
}

// async function makeFileObjects(body) {
//   const buffer = Buffer.from(JSON.stringify(body));

//   const imageDirectory = resolve(process.cwd(), `public/images/mojito.png`);
//   const files = await getFilesFromPath(imageDirectory);

//   files.push(new File([buffer], "data.json"));
//   console.log(files);
//   return files;
// }

function makeStorageClient() {
  console.log("MAKING CLIENT")
  return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
}