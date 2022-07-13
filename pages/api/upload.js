import middleware from "../../middleware/middleware";
import nextConnect from "next-connect";
import { Web3Storage, File, getFilesFromPath } from "web3.storage";
const fs = require("fs");
const { resolve, join, dirname } = require("path");

const handler = nextConnect();
handler.use(middleware);

handler.post(async (req, res) => {
  try {
    console.log("BODY", req.body);
    console.log("FILES", req.files);
    const files = await makeFileObjects(req.body, req.files);
    const cid = await storeFiles(files);
    console.log("stored files with cid:", cid);

    return res.status(200).json({ success: true, cid: cid });
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

async function getNewPath(myFiles){
  for (let item of Object.values(myFiles)) {
    console.log("ITEM")
    if (item[0].originalFilename && item[0].originalFilename !== "") {
      const filePath = resolve(process.cwd(), item[0].path);
      const newPath = join(dirname(filePath), item[0].originalFilename);
      await fs.promises.rename(filePath, newPath);
      return newPath
    }
}
}

async function makeFileObjects(text, myFiles) {
  let files;
  const buffer = Buffer.from(JSON.stringify(text));
  const newPath = await getNewPath(myFiles);
  if (!files) {
    files = await getFilesFromPath(newPath);
  } else {
    let newFiles = await getFilesFromPath(newPath);
    files = [...files, ...newFiles];
  }

  files.push(new File([buffer], "data.json"));
  console.log("FINAL FILES ARRAY", files);

  return files;
}

function makeStorageClient() {
  return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
}
