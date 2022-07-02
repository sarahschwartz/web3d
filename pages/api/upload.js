import middleware from "../../middleware/middleware";
import nextConnect from "next-connect";
import { Web3Storage, File, getFilesFromPath } from "web3.storage";
const fs = require('fs');
const { resolve } = require("path");

const handler = nextConnect();
handler.use(middleware);

handler.post(async (req, res) => {

  try {
    console.log("BODY", req.body)
    console.log("FILES", req.files)
    const files = await makeFileObjects(req.body, req.files);
    const cid = await storeFiles(files);
    console.log("stored files with cid:", cid);
    return res.status(200)
    .json({ success: true, cid: cid });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error storing the file", success: false });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;


async function storeFiles(files) {
  const client = makeStorageClient();
  try {
    const cid = await client.put(files);
    return cid;
  } catch (error) {
    console.log("ERROR", error);
  }
}

async function makeFileObjects(text, myFiles) {
  let files;
  const buffer = Buffer.from(JSON.stringify(text));
  for (let item of Object.values(myFiles)) {
    const filepath = resolve(process.cwd(), item[0].path);
    if(!files){
      files = await getFilesFromPath(filepath);
    } else {
      let newFiles = await getFilesFromPath(filepath);
      files = [...files, ...newFiles]
    }
  }

  files.push(new File([buffer], "data.json"))
  console.log("FINAL FILES ARRAY", files)

  return files;
}

function makeStorageClient() {
  return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
}
