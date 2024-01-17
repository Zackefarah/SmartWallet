import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const getEthereumObject = () => {
  const { ethereum } = window;
  if (!ethereum) {
    console.log("Ethereum object not found, you should install MetaMask!");
    return null;
  }
  return ethereum;
};
const createEthereumContract = () => {
  if (!window.ethereum) {
    console.error("Ethereum object not found");
    return null;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    return transactionsContract;
  } catch (error) {
    console.error("Failed to create Ethereum contract:", error);
    return null;
  }
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) return;

      const transactionsContract = createEthereumContract();
      if (!transactionsContract) return;

      const availableTransactions =
        await transactionsContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        })
      );

      setTransactions(structuredTransactions);
    } catch (error) {
      console.error("Failed to get all transactions:", error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) return;

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      }
    } catch (error) {
      console.error("Failed to check if wallet is connected:", error);
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) return;

      const transactionsContract = createEthereumContract();
      if (!transactionsContract) return;

      const currentTransactionCount =
        await transactionsContract.getTransactionCount();
      window.localStorage.setItem("transactionCount", currentTransactionCount);
    } catch (error) {
      console.error("Failed to check if transactions exist:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) return;

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const sendTransaction = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) return;
      const { addressTo, amount, keyword, message } = formData;
      const transactionsContract = createEthereumContract();
      if (!transactionsContract) return;

      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionsContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      console.log(`Success - ${transactionHash.hash}`);
      setIsLoading(false);

      const transactionsCount =
        await transactionsContract.getTransactionCount();
      setTransactionCount(transactionsCount.toNumber());
      window.location.reload();
    } catch (error) {
      console.error("Failed to send transaction:", error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
