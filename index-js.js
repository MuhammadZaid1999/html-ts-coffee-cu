console.log("hi");
console.log("hi");
console.log("hi");
console.log("hi");
console.log("hi");

// Import necessary functions from viem via CDN
import { 
    createWalletClient, 
    custom, 
    createPublicClient, 
    defineChain,
    parseEther,
    formatEther,
    getContract 
} from "https://esm.sh/viem";
import { contractAddress, coffeeAbi } from "./constants-js.js";

const connectButton = document.getElementById("connectButton");
console.log("connectButton: ",connectButton);
const fundButton = document.getElementById("fundButton");
const ethAmountInput = document.getElementById("ethAmount");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const donationButton = document.getElementById("donationButton");

let walletClient;
let publicClient; 

async function connect() {
    console.log("window.ethereum: ",window.ethereum);
    console.log("typeof window.ethereum: ", typeof window.ethereum);
    if(typeof window.ethereum !== 'undefined') {
        console.log("MetaMask (or compatible wallet) is available!");

        console.log("Connecting using viem...");
        // Create a Wallet Client
        walletClient = createWalletClient({
            transport: custom(window.ethereum) // Use the browser's injected provider
        });

        try{
            // Wait for the user to connect their wallet
            await walletClient.requestAddresses();
            
            connectButton.innerHTML = "Connected";
            console.log("Connection successful!");
            
            // Now you can use walletClient for further interactions
            // e.g., const accounts = await walletClient.getAddresses();
            // console.log("Connected accounts:", accounts);

        } catch (error) {
            console.error("Failed to connect: ", error);
            connectButton.innerHTML = "Connect";
        }

    } else {
        console.log("No wallet detected.");
        connectButton.innerHTML = "Please install MetaMask"; // Update button text
    }
}

async function fund() {
    const ethAmount = ethAmountInput.value;
    console.log(`Funding with ${ethAmount}...`);

    if (typeof window.ethereum !== 'undefined') {
        try {
            // Re-initialize or confirm walletClient
            // Note: We assume 'walletClient' is declared globally (e.g., 'let walletClient;')
            walletClient = createWalletClient({
                transport: custom(window.ethereum) // Use the browser's injected provider
            });

            // Request account access (important step!)
            const [connectedAccount] = await walletClient.requestAddresses();
            console.log("Wallet connected, Account:", connectedAccount);

            const currentChain = await getCurrentChain(walletClient);

            // Create Public Client after Wallet Client is ready
            publicClient = createPublicClient({
                transport: custom(window.ethereum)
            });
            console.log("Public Client Initialized");

            console.log("Attempting simulation...");
            const {request} = await publicClient.simulateContract({
                address: contractAddress,
                abi: coffeeAbi,
                functionName: "fund",
                account: connectedAccount,
                chain: currentChain,
                value: parseEther(ethAmount), // Convert ETH amount to wei
            });
            console.log("Simulation successful, Prepared request:", request);

            const hash = await walletClient.writeContract(request);
            console.log("Transaction sent! Hash:", hash);

        } catch (error) {
            console.error("Transaction Error:", error);
            // Handle simulation errors appropriately (e.g., display message to user)
        }

    } else {
        console.log("Please install MetaMask!");
        fundButton.innerHTML = "Please install MetaMask"; 
    }
}

async function getCurrentChain(client){
    const chainId = await client.getChainId();
    console.log("Current Chain ID:", chainId);

    const currentChain = defineChain({
        id: chainId,
        name: "Local Devnet",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
        },
        rpcUrls: {
            default: { http: ["http://localhost:8545"], },
            // public: { http: ["http://localhost:8545"] }, // Optional: specify public RPC if different
        },
        // Add other chain-specific details if needed (e.g., blockExplorers)
    });

    return currentChain;
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        try{
            publicClient = createPublicClient({
                transport: custom(window.ethereum)
            });

            const balance = await publicClient.getBalance({
                address: contractAddress
            });

            // The balance is returned in Wei as a BigInt
            // Format it into Ether for user-friendly display
            const formattedBalance = formatEther(balance);
            console.log(`Contract Balance: ${formattedBalance} ETH`);

        } catch (error) {
            console.error("Error getting balance:", error);
        }

    } else {
        // Inform the user if MetaMask or another provider isn't installed
        console.log("Please install MetaMask!");
        balanceButton.innerHTML = "Please install MetaMask";
    }

}

async function withdraw() {
    console.log("Initiating withdrawal...");

    if (typeof window.ethereum !== 'undefined') {
        try {
            // Re-initialize or confirm walletClient
            walletClient = createWalletClient({
                transport: custom(window.ethereum) // Use the browser's injected provider
            });

            // Create Public Client after Wallet Client is ready
            publicClient = createPublicClient({
                transport: custom(window.ethereum)
            });
            console.log("Public Client Initialized");
            
            // Request account access (important step!)
            const [connectedAccount] = await walletClient.requestAddresses();
            console.log("Wallet connected, Account:", connectedAccount);

            const currentChain = await getCurrentChain(walletClient);

            console.log("Attempting simulation...");
            const {request} = await publicClient.simulateContract({
                address: contractAddress,
                abi: coffeeAbi,
                functionName: "withdraw", // Changed to withdraw function
                account: connectedAccount,
                chain: currentChain,
            });
            console.log("Simulation successful, Prepared request:", request);

            const hash = await walletClient.writeContract(request);
            console.log("Withdrawal transaction sent! Hash:", hash);

        } catch (error) {
            console.error("Transaction Error:", error);
            // Handle simulation errors appropriately (e.g., display message to user)
        }

    } else {
        console.log("Please install MetaMask!");
        withdrawButton.innerHTML = "Please install MetaMask"; 
    }
}

async function getDonation() {
    if (typeof window.ethereum !== "undefined") {
        try {
            publicClient = createPublicClient({
                transport: custom(window.ethereum)
            });

            const contract = getContract({ 
                address: contractAddress, 
                abi: coffeeAbi, 
                client: publicClient 
            });
            
            const walletAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 
            const myBalance = await contract.read.getAddressToAmountFunded([walletAddress]);
            console.log(`My Donation: ${formatEther(myBalance)} ETH`);
            
        } catch (error) {
            console.error("Error getting donation:", error);
        }
    } else {
        console.log("Please install MetaMask!");
        donationButton.innerHTML = "Please install MetaMask";
    }
}

connectButton.onclick = connect;
// connectButton.addEventListener("click", connect); ---- this is another way to add an event listener
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
donationButton.onclick = getDonation;