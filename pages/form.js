import { useState } from "react";
import Head from "next/head";
import styles from "../styles/Form.module.css";

export default function UploadForm() {
  const [projectName, setProjectName] = useState("");
  const [file, setFile] = useState(null);

  // this is where we set the conditions that allow users to access a file
  // this example checks if the user's wallet address is a specific address
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain,
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: "0xFAc3414518A0A0A5c955151b077c9222a41786Ff",
      },
    },
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    let formData = new FormData();
    formData.append("file", file);
    formData.append("text", projectName);

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
            <label htmlFor="file" className={styles.inputLabel}>
              Project Files
            </label>
            <div className={styles.inputContainer}>
              <input
                type="file"
                id="file"
                multiple
                required
                onChange={(e) => {
                  setFile(e.target.files[0]);
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
