import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Form.module.css";
import Lit from "../utils/getLit";
import connectContract from "../utils/connectContract";
import { ethers } from "ethers";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
// import { useNetwork, useSwitchNetwork } from 'wagmi'

export default function UploadForm() {
  // const { data: account } = useAccount();
  // const { chain } = useNetwork()
  // console.log("HEY", useSwitchNetwork)
  // const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCost, setProjectCost] = useState(0);
  const [files, setFiles] = useState(null);
  const [encrypt, setEncrypt] = useState(false);
  const [cid, setCid] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [tokenID, setTokenID] = useState(null)

  useEffect(() => {
    setTokenID(Math.floor(Math.random() * 999999999));
    console.log("SET TOKEN ID")
  }, [])

function getAccessControlConditions(){
  const accessControlConditions = [
    {
      contractAddress: "0x712cde52d7bD9ecca383cc9231Be9fd00Bc9cC6D",
      standardContractType: "ERC1155",
      chain: "mumbai",
      method: "balanceOf",
      parameters: [":userAddress", tokenID ? tokenID.toString() : '0'],
      returnValueTest: {
        comparator: ">",
        value: "0",
      },
    },
  ];
  return accessControlConditions;
}

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    // change files object into files array
    let filestoEncrypt = files;
    let filesArray = [];
    for (let i = 0; i < filestoEncrypt.length; i++) {
      filesArray.push(filestoEncrypt[i]);
    }

    if (encrypt) {
      await uploadAndEncrypt(filesArray);
    } else {
      await uploadRaw(filesArray);
    }
  }

  async function uploadRaw(filesArray) {
    let formData = new FormData();
    filesArray.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    formData.append("name", projectName);
    formData.append("description", projectDescription);
    const tempCid = await uploadToIPFS(formData);
    setCid(tempCid);
  }

  async function uploadAndEncrypt(filesArray) {
    let lit = new Lit();
    await lit.connect();
    const accessControlConditions = getAccessControlConditions()

    const { encryptedFiles, encryptedSymmetricKey } = await lit.encryptFiles(
      accessControlConditions,
      filesArray
    );
    console.log("ENCRYPTED FILES", encryptedFiles);

    let formData = new FormData();
    let zip = new File([encryptedFiles], "project.zip");
    formData.append("file", zip);
    formData.append("key", encryptedSymmetricKey);
    formData.append("name", projectName);
    formData.append("description", projectDescription);
    const tempCid = await uploadToIPFS(formData);
    setCid(tempCid);
  }

  async function uploadToIPFS(formData) {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.status !== 200) {
        console.log("ERROR", response);
      } else {
        console.log("Form successfully submitted!");
        let responseJSON = await response.json();
        console.log("CID:", responseJSON.cid);
        return responseJSON.cid;
      }
    } catch (error) {
      alert(
        `Oops! Something went wrong. Please refresh and try again. Error ${error}`
      );
    }
  }

  async function mintProject() {
    try {
      const marketplaceContract = connectContract();
      if (marketplaceContract) {
        let cost
        if(encrypt){
          cost = ethers.utils.parseEther(projectCost);
        } else{
          cost = ethers.utils.parseEther(0);
        }

        const txn = await marketplaceContract.mintProject(tokenID, cid, cost, {
          gasLimit: 900000,
        });

        console.log("Minting...", txn.hash);
        let wait = await txn.wait();
        console.log("Minted -- ", txn.hash);
      }
    } catch (error) {
      console.log("ERROR MINTING PROJECT", error);
    }
  }

  return (
    <div className="">
      <Head>
        <title>Upload</title>
        <meta name="description" content="Upload your project files" />
      </Head>
      <section className="">
        {/* <ConnectButton /> */}
        {tokenID && <div>{tokenID}</div>}

        {/* {chain && <div>Connected to {chain.name}</div>}

      {chains.map((x) => (
        <button
          disabled={!switchNetwork || x.id === chain?.id}
          key={x.id}
          onClick={() => switchNetwork?.(x.id)}
        >
          {x.name}
          {isLoading && pendingChainId === x.id && ' (switching)'}
        </button>
      ))}

      <div>{error && error.message}</div> */}


        {/* {account && ( */}
          <form onSubmit={handleSubmit} className={styles.formContainer}>

            <div className={styles.inputGroup}>
              <label htmlFor="project-name" className={styles.inputLabel}>
                Name
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="project-name"
                  name="project-name"
                  type="text"
                  className={styles.formInput}
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
            </div>


            <div className={styles.inputGroup}>
              <label
                htmlFor="project-description"
                className={styles.inputLabel}
              >
                Description
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="project-description"
                  name="project-description"
                  type="text"
                  className={styles.formInput}
                  required
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </div>
            </div>

            {encrypt && (
              <div className={styles.inputGroup}>
                <label htmlFor="project-cost" className={styles.inputLabel}>
                  Cost (MATIC)
                </label>
                <div className={styles.inputContainer}>
                  <input
                    id="project-cost"
                    name="project-cost"
                    type="number"
                    className={styles.formInput}
                    required
                    value={projectCost}
                    onChange={(e) => setProjectCost(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="files" className={styles.inputLabel}>
                Project Files
              </label>
              <div className={styles.inputContainer}>
                <input
                  type="file"
                  id="files"
                  multiple
                  required
                  accept=".gltf"
                  onChange={(e) => {
                    setFiles(e.target.files);
                  }}
                />
              </div>
            </div>

            <div className="">
              <button
                type="button"
                className=""
                onClick={() => {
                  setEncrypt(!encrypt);
                }}
              >
                Encrypt Files
              </button>
            </div>

            <div>{encrypt.toString()}</div>

            <div className="">
              <button type="submit" className="">
                Upload Files
              </button>
            </div>
          </form>
        {/* )} */}

        {submitted && 
        <button type="button" className="" onClick={mintProject}>
          Mint Project
        </button>}

        <button onClick={(() => {console.log(tokenID)})}>k</button>

      </section>
    </div>
  );
}
