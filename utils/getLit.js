import LitJsSdk from "lit-js-sdk";

const client = new LitJsSdk.LitNodeClient();
const chain = "ethereum";
const standardContractType = "ERC721";

class Lit {
  litNodeClient;

  async connect() {
    await client.connect();
    this.litNodeClient = client;
  }
}

export default new Lit();

// this is where we set the conditions that allow users to access a file

// this example checks that the balance of the user's address is more than .000001 ETH
const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "1000000000000", // 0.000001 ETH
    },
  },
];

async function encrypt(file) {
  if (!this.litNodeClient) {
    await this.connect();
  }

  // This will ask metamask to sign a message proving the holder owns the crypto address.
  const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
  // for large files (more than 20mb) use encryptFile()

  const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile(file);

  const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
    accessControlConditions,
    symmetricKey,
    authSig,
    chain,
  });

  return {
    encryptedFile,
    encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
      encryptedSymmetricKey,
      "base16"
    ),
  };
}
