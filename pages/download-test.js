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
// unencrypted
// const cid = "bafybeidb3dbhebqfltauasfp2xvaxa5tz6bg2i3xv6h5rb3yabqcmi3yhe";
// encrypted
const cid = "bafybeienxmzvpnzvx2676kikekb2vfbssj2euqbms63fl4dp2jqlu4u6oa"

export default function Download() {
  const [loading, setLoading] = useState(false)
  const [encrypted, setEncrypted] = useState(true);
  const [rawFiles, setRawFiles] = useState(null);
  const [encryptedFiles, setEncryptedFiles] = useState(null);
  const [returnedFiles, setReturnedFiles] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("");
  const [links, setLinks] = useState(null)
  const [projectInfo, setProjectInfo] = useState(null)

  useEffect(() => {
    async function runGetLinks() {
      const myLinks = await getLinks(cid)
      setLinks(myLinks)
    }

    async function getProjectInfo() {
      const res = await fetch(`https://ipfs.io/ipfs/${cid}/data.json`)
      const json = await res.json()
      setProjectInfo(json)
    }

    runGetLinks();
    getProjectInfo();
  }, [])

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
    setLoading(true)
    if (!encrypted) {
      let raw = [];
      for await (const link of links) {
        if(link.name !== "data.json"){
          let res = await fetch(`https://ipfs.io/ipfs/${link.path}`)
          let blob = await res.blob()
          const file = {
                path: URL.createObjectURL(blob),
                name: link.name
              }
          raw.push(file);
        }
      }
      setRawFiles(raw)
      setLoading(false)
    } else {
      let lit = new Lit();
      await lit.connect();
      console.log("CONNECTED");
      const res =  await fetch('https://ipfs.io/ipfs/bafybeienxmzvpnzvx2676kikekb2vfbssj2euqbms63fl4dp2jqlu4u6oa/aENQvwJwnRg4NFG0Yv0PvAH4.zip')
      let blob = await res.blob()
      const { decryptedZip } = await lit.decryptFiles(
        accessControlConditions,
        blob,
        "0fb19fab5b1669ece749596747e8c9611b77275dfb5503c7ca4c4f3e511b526fab3d5682fa791b9b78957c0bac522f0a8afde462fba60831aceb4edfc61b83bac164544e51f8be2061094feaa6db465b8c4cdb1f901418b3098361da3adc29b5b8c0aacd2462cc9e569c3c399221e4fb22175b6aa9a0841e98572fc73554528c0000000000000020c6e3764d11ba5635e5260a852777f75b18ce6963c28ef1174b10b0384c661cfa3d5ea6b3ab89bcdd2abd3a0b3c98158c"
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
      setLoading(false)
    }
  };

  return (
    <div>
      <h1>Download Files</h1>

      {projectInfo?.text && (<div>Project Name: {projectInfo.text[0]}</div>)}
      {projectInfo?.description && (<div>Description: {projectInfo.description[0]}</div>)}

      {!returnedFiles && !downloadFileName && !loading && (
        <button onClick={() => prepareDownload()}>Prepare Download</button>
      )}

      {returnedFiles && downloadFileName && !loading && (
        <div>
          <a href={returnedFiles} download={downloadFileName}>
            Download Encrypted Files
          </a>
        </div>
      )}

      {loading && <div> Loading.... </div>}

      {rawFiles && !loading && (
        <div>
          {rawFiles.map((file) => (
            <a href={file.path} download={file.name} key={file.path} style={{marginBottom: "20px", display: "block"}}>
              Download {file.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
