import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
// import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
// import connectContract from "../utils/connectContract";
import styles from "../styles/Form.module.css";

export default function CreateEvent() {
  const { data: account } = useAccount();

  const [eventName, setEventName] = useState("");
  const [file, setFile] = useState(null);
  const [eventTime, setEventTime] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [refund, setRefund] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const [success, setSuccess] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(null);
  const [eventID, setEventID] = useState(null);


  async function handleSubmit(e) {
    e.preventDefault();

    let formData = new FormData()
    formData.append('file', file)
    formData.append('text', eventName)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        // headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });
      if (response.status !== 200) {
        console.log("ERROR", response)
      } else {
        console.log("Form successfully submitted!");
        // let responseJSON = await response.json();
        // console.log("CID:", responseJSON.cid);
      }
      // check response, if success is false, dont take them to success page
    } catch (error) {
      alert(
        `Oops! Something went wrong. Please refresh and try again. Error ${error}`
      );
    }
  }

  return (
    <div className="">
      <Head>
        <title>Create your event | web3rsvp</title>
        <meta
          name="description"
          content="Create your virtual event on the blockchain"
        />
      </Head>
      <section className="">
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <label htmlFor="eventname" className={styles.inputLabel}>
              Event name
            </label>
            <div className={styles.inputContainer}>
              <input
                id="event-name"
                name="event-name"
                type="text"
                className={styles.formInput}
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="file" className={styles.inputLabel}>
              Event name
            </label>
            <div className={styles.inputContainer}>
            <input 
                type="file" 
                id="file" 
                multiple
                required
                onChange={(e) => {setFile(e.target.files[0])}}
            />
              {/* <input
                id="file"
                name="file"
                type="file"
                className={styles.formInput}
                required
                value={file}
                // onChange={(e) => setFile(e.target.files)}
                
              /> */}
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
