import './App.css';
import { useEffect } from 'react';


const App = () => {

  const checkIfWalletIsConnected = async () => {

    try {

      const { solana } = window;
      if (solana.isPhantom) {
        console.log("Phantom Wallet Detected !");
      }
      else {
        alert("Solana Object not found ! Get Phantom Wallet")
      }

    } catch (error) {

      console.error(error);
    }

  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener("load", onLoad);
  }, []);

}

export default App;
