import './App.css';
import idl from "./idl.json"
import { useEffect, useState } from 'react';
import React from 'react';

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@coral-xyz/anchor';

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed",
}

const { SystemProgram } = web3;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const checkIfWalletIsConnected = async () => {

    const getProvider = () => {
      const connection = new Connection(network, opts.preflightCommitment);
      const provider = new AnchorProvider(
        connection,
        window.solana,
        opts.preflightCommitment
      );

      return provider;
    }
    try {

      const { solana } = window;
      if (solana.isPhantom) {
        console.log("Phantom Wallet Detected !");

        const response = await solana.connect({
          onlyIfTrusted: true,
        });
        console.log("Connected with public key:", response.publicKey.toString());

        setWalletAddress(response.publicKey.toString())
      }
      else {
        alert("Solana Object not found ! Get Phantom Wallet")
      }

    } catch (error) {

      console.error(error);
    }

  };

  const connectWallet = async () => {

    const { solana } = window;

    if (solana) {
      const response = solana.connect();
      console.log('Connected with public key :', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString())
    }



  }

  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}>Connect to Wallet</button>
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener("load", onLoad);
  }, []);
  return (<div className='App'>{!walletAddress && renderNotConnectedContainer()}</div>);

}


export default App;
