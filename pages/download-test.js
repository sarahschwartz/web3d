import { useState, useEffect } from "react";
import { create } from "ipfs-http-client";
import Lit from "../utils/getLit";

const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    method: "",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: "=",
      value: "0xFAc3414518A0A0A5c955151b077c9222a41786Ff",
    },
  },
];

// const encryptedSymmetricKey =
// "4cef000f751164065ac465d866d3104b56fbc6dc9e0028aa46e41a479fe2617712bdd876f8fd9e2a0d3688a136c21a18007d1b199074386ad1c4499360867679784d516bc96816cc38ca5e6e2f1d866c91a06671f88592e6a36638be2d467e99cf5ac5f3cabf3df5eae94937e4ece40708f08205036ad5245d99b41a7920ba65000000000000002007f24c2c9448f18a3bbae832af0c8fddf073a0ee4c62ca7806c385ab220d0dcc052b0d1e3adae0fdcbc9f314049e7593";
// const cid = "bafybeicabimw2hofnfio5oaxxmoddyeol5nvtnvq6mdcmpgsewjqcqsmb4";
const cid = "bafybeidb3dbhebqfltauasfp2xvaxa5tz6bg2i3xv6h5rb3yabqcmi3yhe";

export default function Download() {
  const [encrypted, setEncrypted] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [encryptedFiles, setEncryptedFiles] = useState(null);
  const [returnedFiles, setReturnedFiles] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("");

  async function getLinks(ipfsPath) {
    const url = "https://dweb.link/api/v0";
    const ipfs = create({ url });

    const links = [];
    for await (const link of ipfs.ls(ipfsPath)) {
      links.push(link);
    }
    return links;
  }

  const prepareDownload = async () => {
    if (!encrypted) {
      const links = await getLinks(cid);
      for(let i = 0; i < links.length; i++){
        if(links[i].name !== "data.json"){
          fetch(`https://ipfs.io/ipfs/${links[i].path}`)
          .then(res => res.blob())
          .then((res) => {
            console.log("RESPONSE BLOB", res)
          })
        }
      }
      setDownloadLinks(links);
    } else {
      let lit = new Lit();
      await lit.connect();
      console.log("CONNECTED");
      const { decryptedZip } = await lit.decryptFiles(
        accessControlConditions,
        encryptedFiles,
        encryptedSymmetricKey
      );
      console.log("DECRYPTED ZIP", decryptedZip);

      let filePath;

      for (let item of Object.values(decryptedZip)) {
        if (item.dir === false) {
          filePath = item.name;
          break;
        }
      }

      if (!filePath) {
        console.log("FILE NOT FOUND!");
        return;
      }

      const gltfBlob = await decryptedZip[filePath].async("blob");

      setReturnedFiles(URL.createObjectURL(gltfBlob));

      setDownloadFileName(filePath.substring(filePath.lastIndexOf("/") + 1));
    }
  };

  return (
    <div>
      <h1>Download Files</h1>
      {!returnedFiles && !downloadFileName && (
        <button onClick={() => prepareDownload()}>Prepare Download</button>
      )}

      {returnedFiles && downloadFileName && (
        <div>
          <a href={returnedFiles} download={downloadFileName}>
            Download Encrypted Files
          </a>
        </div>
      )}

      <button
        onClick={() => {
          console.log(downloadLinks);
        }}
      >
        links
      </button>

      {!encrypted && downloadLinks.length > 0 && (
        <div>
          {downloadLinks.map((file) => (
            <a href={file.path} download={file.name} key={file.name} style={{marginBottom: "20px", display: "block"}}>
              Download {file.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
