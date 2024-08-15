import React, { useEffect, useState } from "react";
import "./App.css";
import idl from "./idl.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";
import { Buffer } from "buffer";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Container,
  CssBaseline,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { AddCircleOutline, AccountBalanceWallet } from "@mui/icons-material";

window.Buffer = Buffer;

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed",
};
const { SystemProgram } = web3;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDescription, setNewCampaignDescription] = useState("");

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
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          const response = await solana.connect({
            onlyIfTrusted: true,
          });
          console.log(
            "Connected with public key:",
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Get a Phantom wallet");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log(
        "Connected with public key:",
        response.publicKey.toString()
      );
      setWalletAddress(response.publicKey.toString());
    }
  };

  const getCampaigns = async () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    Promise.all(
      (await connection.getProgramAccounts(programID)).map(
        async (campaign) => ({
          ...(await program.account.campaign.fetch(campaign.pubkey)),
          pubkey: campaign.pubkey,
        })
      )
    ).then((campaigns) => setCampaigns(campaigns));
  };

  const createCampaign = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const [campaign] = await PublicKey.findProgramAddress(
        [
          utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );
      await program.rpc.create(newCampaignName, newCampaignDescription, {
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log("Created a new campaign w/ address:", campaign.toString());
      setOpenCreateDialog(false);
      getCampaigns();
    } catch (error) {
      console.error("Error creating campaign account:", error);
    }
  };

  const donate = async (publicKey) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.donate(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          campaign: publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log("Donated some money to:", publicKey.toString());
      getCampaigns();
    } catch (error) {
      console.error("Error donating:", error);
    }
  };

  const withdraw = async (publicKey) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.withdraw(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          campaign: publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("Withdrew some money from:", publicKey.toString());
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  const renderNotConnectedContainer = () => (
    <Box textAlign="center" mt={5}>
      <Button
        variant="contained"
        color="primary"
        onClick={connectWallet}
        startIcon={<AccountBalanceWallet />}
      >
        Connect to Wallet
      </Button>
    </Box>
  );

  const renderConnectedContainer = () => (
    <Box mt={5}>
      <Box textAlign="center" mb={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateDialog(true)}
          startIcon={<AddCircleOutline />}
        >
          Create a Campaign
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={getCampaigns}
          sx={{ ml: 2 }}
        >
          Get Campaigns
        </Button>
      </Box>
      <Grid container spacing={3}>
        {campaigns.map((campaign) => (
          <Grid item xs={12} sm={6} md={4} key={campaign.pubkey.toString()}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="https://img.freepik.com/free-vector/sri-lanka-large-letters-title-header-horizontal-gradient-background-banner-with-tourists-attractions-national-food_1284-60630.jpg"
                alt="campaign image"
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {campaign.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {campaign.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Campaign ID: {campaign.pubkey.toString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Balance: {(campaign.amountDonated / web3.LAMPORTS_PER_SOL).toString()} SOL
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => donate(campaign.pubkey)}
                    fullWidth
                  >
                    Donate
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => withdraw(campaign.pubkey)}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Withdraw
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <Container maxWidth="lg">
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Solana Crowdfunding
          </Typography>
          {walletAddress ? (
            <Typography variant="subtitle1" color="inherit">
              Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </Typography>
          ) : (
            <Button color="inherit" onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box mt={5}>
        <Typography variant="h4" align="center" gutterBottom>
          Campaigns
        </Typography>
        {!walletAddress && renderNotConnectedContainer()}
        {walletAddress && renderConnectedContainer()}
      </Box>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Create a New Campaign</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Campaign Name"
            fullWidth
            variant="outlined"
            value={newCampaignName}
            onChange={(e) => setNewCampaignName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Campaign Description"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newCampaignDescription}
            onChange={(e) => setNewCampaignDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={createCampaign} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default App;
