import LitJsSdk from "lit-js-sdk";

const client = new LitJsSdk.LitNodeClient();
const chain = "ethereum";

class Lit {
  litNodeClient;

  async connect() {
    await client.connect();
    this.litNodeClient = client;
  }

  async encrypt(accessControlConditions, files) {
    if (!this.litNodeClient) {
      await this.connect();
    }
    // This will ask the user to sign a message proving the holder owns the crypto address.
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    // encrypt an array of files
    const { encryptedFiles, symmetricKey } = await LitJsSdk.zipAndEncryptFiles(
      files
    );

    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });

    return {
      encryptedFiles,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
        encryptedSymmetricKey,
        "base16"
      ),
    };
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
}

export default new Lit();
