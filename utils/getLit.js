import LitJsSdk from "lit-js-sdk";

const client = new LitJsSdk.LitNodeClient();
const chain = "ethereum";

class Lit {
  litNodeClient;

  async connect() {
    await client.connect();
    this.litNodeClient = client;
  }

  async encryptFiles(accessControlConditions, files) {
    if (!this.litNodeClient) {
      await this.connect();
    }
    // This will ask the user to sign a message proving the holder owns the crypto address.
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    try {
       // encrypt an array of files
    const { encryptedZip, symmetricKey } = await LitJsSdk.zipAndEncryptFiles(
      files
    );

    console.log("FILES RETURNED", encryptedZip)

    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });

    return {
      encryptedFiles: encryptedZip,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
        encryptedSymmetricKey,
        "base16"
      ),
    };
      
    } catch (err) {
      console.log("ERROR", err)
    }
   
  }

  async decrypt(
    accessControlConditions,
    encryptedZipFile,
    encryptedSymmetricKey
  ) {
    if (!this.litNodeClient) {
      await this.connect();
    }

    const authSig = await LitJsSdk.checkAndSignAuthMessage();
    const symmetricKey = await this.litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig,
    });

    const decryptedZip = await LitJsSdk.decryptZip(
      encryptedZipFile,
      symmetricKey
    );

    return { decryptedZip };
  }

  async encryptString(str) {
    if (!this.litNodeClient) {
      await this.connect()
    }
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(str)

    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      accessControlConditions: accessControlConditionsNFT,
      symmetricKey,
      authSig,
      chain,
    })

    return {
      encryptedFile: encryptedString,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
    }
  }

  async decryptString(encryptedStr, encryptedSymmetricKey) {
    if (!this.litNodeClient) {
      await this.connect()
    }
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    const symmetricKey = await this.litNodeClient.getEncryptionKey({
      accessControlConditions: accessControlConditionsNFT,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig
    })
    const decryptedFile = await LitJsSdk.decryptString(
      encryptedStr,
      symmetricKey
    );
    // eslint-disable-next-line no-console
    console.log({
      decryptedFile
    })
    return { decryptedFile }
  }

}

export default Lit;
