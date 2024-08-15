import './App.css';
import { useEffect } from 'react';
import React from 'react';


const App = () => {

  const checkIfWalletIsConnected = async () => {

    try {

      const { solana } = window;
      if (solana.isPhantom) {
        console.log("Phantom Wallet Detected !");

        const response = await solana.connect({
          onlyIfTrusted: true,
        });
        console.log("Connected with public key:", response.publicKey.toString())
      }
      else {
        alert("Solana Object not found ! Get Phantom Wallet")
      }

    } catch (error) {

      console.error(error);
    }

  };

  const connectWallet = async () => {

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
  return (<div className='App'>{renderNotConnectedContainer()}</div>);

}


export default App;
