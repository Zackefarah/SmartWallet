import React from "react";
import { createRoot } from "react-dom/client"; // Updated import
import App from "./App.jsx";
import "./index.css";
import { TransactionsProvider } from "./context/TransactionContext";

const container = document.getElementById("root");
const root = createRoot(container); // Updated usage

root.render(
  <TransactionsProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </TransactionsProvider>
);
