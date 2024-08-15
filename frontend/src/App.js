import './App.css';
import idl from "./idl.json";
import { useEffect, useState } from 'react';
import React from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils } from '@coral-xyz/anchor';
import { Buffer } from "buffer";

window.Buffer = Buffer;


const programID = new PublicKey(idl.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed",
};

const { SystemProgram } = web3;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana.isPhantom) {
        console.log("Phantom Wallet Detected!");

        const response = await solana.connect({
          onlyIfTrusted: true,
        });
        console.log("Connected with public key:", response.publicKey.toString());

        setWalletAddress(response.publicKey.toString());
      } else {
        alert("Solana Object not found! Get Phantom Wallet");
      }
    } catch (error) {
      console.error("Error checking if wallet is connected:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window;

      if (solana) {
        const response = await solana.connect();
        console.log('Connected with public key:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const createCampaign = async () => {
    try {
      if (!programID) {
        throw new Error("Program ID is not defined or invalid.");
      }

      const provider = getProvider();

      if (!idl || !idl.instructions || !idl.accounts) {
        throw new Error("IDL is missing or incomplete.");
      }

      const program = new Program(idl, programID, provider);

      const [campaign] = await PublicKey.findProgramAddress(
        [
          utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.rpc.create("campaign name", "campaign description", {
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });

      console.log('Created a new campaign w/ address:', campaign.toString());
    } catch (error) {
      console.error("Error creating campaign account:", error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to Wallet</button>
  );

  const renderConnectedContainer = () => (
    <button onClick={createCampaign}>Create a campaign</button>
  );

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className='App'>
      {!walletAddress && renderNotConnectedContainer()}
      {walletAddress && renderConnectedContainer()}
    </div>
  );
};

export default App;
