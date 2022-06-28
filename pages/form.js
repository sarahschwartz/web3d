import { useState } from "react";
import Head from "next/head";
import styles from "../styles/Form.module.css";
import Lit from "../utils/getLit"

const getLit = async (filestoEncrypt) => {
  // change files object into files array
  let filesArray = []
  for(let i = 0; i < filestoEncrypt.length; i++){
    filesArray.push(filestoEncrypt[i])
  }

  console.log("FILES ARRAY", filesArray)

  const lit = new Lit()
  await lit.connect()

  // console.log("LIT:", lit)
  // this is where we set the conditions that allow users to access a file
  // this example checks if the user's wallet address is a specific address
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
  
  const encrypted = await lit.encryptFiles(
    accessControlConditions, 
    filesArray
    )

  console.log("ENCRYPTED", encrypted)
  return encrypted
}


export default function UploadForm() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [files, setFiles] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const {encryptedFiles, encryptedSymmetricKey} = await getLit(files)

    let formData = new FormData();
    formData.append("files", encryptedFiles)
    formData.append("key", encryptedSymmetricKey)
    formData.append("text", projectName);
    formData.append("description", projectDescription);

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
      }
    } catch (error) {
      alert(
        `Oops! Something went wrong. Please refresh and try again. Error ${error}`
      );
    }
  }

  return (
    <div className="">
      <Head>
        <title>Upload</title>
        <meta name="description" content="Upload your project files" />
      </Head>
      <section className="">
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <label htmlFor="projectname" className={styles.inputLabel}>
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
            <label htmlFor="projectname" className={styles.inputLabel}>
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
            <div className="">
              <button type="submit" className="">
                Create
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
