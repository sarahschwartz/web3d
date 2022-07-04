import { useState, useEffect } from "react";
import { create } from "ipfs-http-client";
import { useRouter } from "next/router";
import Lit from "../../utils/getLit";

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

export default function Download() {
  const router = useRouter();
  const { cid } = router.query;

  const [loading, setLoading] = useState(false);
  const [encrypted, setEncrypted] = useState(false);
  const [rawFiles, setRawFiles] = useState(null);
  const [returnedFiles, setReturnedFiles] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("");
  const [links, setLinks] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);

  useEffect(() => {
    async function runGetLinks() {
      const myLinks = await getLinks(cid);
      setLinks(myLinks);
    }

    async function getProjectInfo() {
      const res = await fetch(`https://ipfs.io/ipfs/${cid}/data.json`);
      const json = await res.json();
      if(json.key){
        setEncrypted(true)
      }
      setProjectInfo(json);
      
    }

    if(cid){
      runGetLinks();
      getProjectInfo();
    }
    
  }, [cid]);

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
    setLoading(true);
    if (!encrypted) {
      let raw = [];
      for await (const link of links) {
        if (link.name !== "data.json") {
          let res = await fetch(`https://ipfs.io/ipfs/${link.path}`);
          let blob = await res.blob();
          const file = {
            path: URL.createObjectURL(blob),
            name: link.name,
          };
          raw.push(file);
        }
      }
      setRawFiles(raw);
      setLoading(false);
    } else {
      let lit = new Lit();
      await lit.connect();
      const res = await fetch(
        `https://ipfs.io/ipfs/${cid}/${links[0].name}`
      );
      let blob = await res.blob();
      const { decryptedZip } = await lit.decryptFiles(
        accessControlConditions,
        blob,
        projectInfo.key[0]
      );
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
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Download {projectInfo?.key ? "Encrypted" : "Public"} Files</h1>

      {projectInfo?.name && <div>Project Name: {projectInfo.name[0]}</div>}
      {projectInfo?.description && (
        <div>Description: {projectInfo.description[0]}</div>
      )}

      {!returnedFiles && !downloadFileName && !loading && (
        <button onClick={() => prepareDownload()}>Prepare Download</button>
      )}

      <button onClick={() => {console.log(links)}}>Links</button>

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
            <a
              href={file.path}
              download={file.name}
              key={file.path}
              style={{ marginBottom: "20px", display: "block" }}
            >
              Download {file.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
