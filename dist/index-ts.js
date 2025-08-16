"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary types and functions from viem
const viem_1 = require("viem");
require("viem/window");
const constants_ts_1 = require("./constants-ts");
// DOM Elements
const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethAmountInput = document.getElementById("ethAmount");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
// Client instances
let walletClient;
let publicClient;
// Helper function to get the current chain
async function getCurrentChain(client) {
    const chainId = await client.getChainId();
    console.log("Current Chain ID:", chainId);
    const currentChain = (0, viem_1.defineChain)({
        id: chainId,
        name: "Local Devnet",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
        },
        rpcUrls: {
            default: { http: ["http://localhost:8545"] },
        }
    });
    return currentChain;
}
// Connect function
async function connect() {
    if (!connectButton)
        return;
    if (typeof window.ethereum !== 'undefined') {
        console.log("MetaMask (or compatible wallet) is available!");
        walletClient = (0, viem_1.createWalletClient)({
            transport: (0, viem_1.custom)(window.ethereum)
        });
        try {
            await walletClient.requestAddresses();
            connectButton.innerHTML = "Connected!";
            console.log("Connection successful!");
        }
        catch (error) {
            console.error("Failed to connect: ", error);
            connectButton.innerHTML = "Connect";
        }
    }
    else {
        console.log("No wallet detected.");
        connectButton.innerHTML = "Please install MetaMask!";
    }
}
// Fund function
async function fund() {
    if (!ethAmountInput || !fundButton)
        return;
    const ethAmount = ethAmountInput.value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== 'undefined') {
        walletClient = (0, viem_1.createWalletClient)({
            transport: (0, viem_1.custom)(window.ethereum)
        });
        try {
            const [connectedAccount] = await walletClient.requestAddresses();
            console.log("Wallet connected, Account:", connectedAccount);
            const currentChain = await getCurrentChain(walletClient);
            publicClient = (0, viem_1.createPublicClient)({
                transport: (0, viem_1.custom)(window.ethereum)
            });
            console.log("Public Client Initialized");
            console.log("Attempting simulation...");
            const { request } = await publicClient.simulateContract({
                address: constants_ts_1.contractAddress,
                abi: constants_ts_1.coffeeAbi,
                functionName: "fund",
                account: connectedAccount,
                chain: currentChain,
                value: (0, viem_1.parseEther)(ethAmount),
            });
            console.log("Simulation successful, Prepared request:", request);
            const hash = await walletClient.writeContract(request);
            console.log("Transaction sent! Hash:", hash);
        }
        catch (error) {
            console.error("Transaction simulation failed:", error);
            fundButton.innerHTML = "Transaction Failed";
        }
    }
    else {
        console.log("Please install MetaMask!");
        if (fundButton)
            fundButton.innerHTML = "Please install MetaMask!";
    }
}
// Get balance function
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        publicClient = (0, viem_1.createPublicClient)({
            transport: (0, viem_1.custom)(window.ethereum)
        });
        try {
            const balance = await publicClient.getBalance({
                address: constants_ts_1.contractAddress
            });
            const formattedBalance = (0, viem_1.formatEther)(balance);
            console.log(`Contract Balance: ${formattedBalance} ETH`);
            if (balanceButton)
                balanceButton.innerHTML = `Balance: ${formattedBalance} ETH`;
        }
        catch (error) {
            console.error("Error getting balance:", error);
            if (balanceButton)
                balanceButton.innerHTML = "Error fetching balance";
        }
    }
    else {
        console.log("Please install MetaMask!");
        if (balanceButton)
            balanceButton.innerHTML = "Please install MetaMask!";
    }
}
// Withdraw function
async function withdraw() {
    if (!withdrawButton)
        return;
    console.log("Initiating withdrawal...");
    if (typeof window.ethereum !== 'undefined') {
        walletClient = (0, viem_1.createWalletClient)({
            transport: (0, viem_1.custom)(window.ethereum)
        });
        try {
            const [connectedAccount] = await walletClient.requestAddresses();
            console.log("Wallet connected, Account:", connectedAccount);
            const currentChain = await getCurrentChain(walletClient);
            publicClient = (0, viem_1.createPublicClient)({
                transport: (0, viem_1.custom)(window.ethereum)
            });
            console.log("Public Client Initialized");
            console.log("Attempting simulation...");
            const { request } = await publicClient.simulateContract({
                address: constants_ts_1.contractAddress,
                abi: constants_ts_1.coffeeAbi,
                functionName: "withdraw",
                account: connectedAccount,
                chain: currentChain,
            });
            console.log("Simulation successful, Prepared request:", request);
            const hash = await walletClient.writeContract(request);
            console.log("Withdrawal transaction sent! Hash:", hash);
            withdrawButton.innerHTML = "Withdrawal Sent!";
        }
        catch (error) {
            console.error("Transaction simulation failed:", error);
            withdrawButton.innerHTML = "Withdrawal Failed";
        }
    }
    else {
        console.log("Please install MetaMask!");
        withdrawButton.innerHTML = "Please install MetaMask!";
    }
}
// Event listeners
if (connectButton)
    connectButton.onclick = connect;
if (fundButton)
    fundButton.onclick = fund;
if (balanceButton)
    balanceButton.onclick = getBalance;
if (withdrawButton)
    withdrawButton.onclick = withdraw;
