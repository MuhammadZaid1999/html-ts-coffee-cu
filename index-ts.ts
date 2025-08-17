console.log("Live reload!");

// Import necessary types and functions from viem
import { 
    createWalletClient, 
    custom, 
    createPublicClient, 
    defineChain,
    parseEther,
    formatEther,
    WalletClient,
    getContract,
    type PublicClient,
    type Chain,
    Address,
    type Hash
} from "viem";
import "viem/window";
import { contractAddress, coffeeAbi } from "./constants-ts";

// DOM Elements
const connectButton: HTMLButtonElement = document.getElementById("connectButton") as HTMLButtonElement;
const fundButton: HTMLButtonElement = document.getElementById("fundButton") as HTMLButtonElement;
const ethAmountInput: HTMLInputElement = document.getElementById("ethAmount") as HTMLInputElement;
const balanceButton: HTMLButtonElement = document.getElementById("balanceButton") as HTMLButtonElement;
const withdrawButton: HTMLButtonElement = document.getElementById("withdrawButton") as HTMLButtonElement;
const donationButton: HTMLButtonElement = document.getElementById("donationButton") as HTMLButtonElement;

// Client instances
let walletClient: WalletClient;
let publicClient: PublicClient;

// Helper function to get the current chain
async function getCurrentChain(client: WalletClient): Promise<Chain> {
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
        },
    });

    return currentChain;
}

// Connect function
async function connect(): Promise<void> {
    if (typeof window.ethereum !== 'undefined') {
        console.log("MetaMask (or compatible wallet) is available!");

        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        });

        try {
            await walletClient.requestAddresses();
            connectButton.innerHTML = "Connected";
            console.log("Connection successful!");
        } catch (error) {
            console.error("Failed to connect: ", error);
            connectButton.innerHTML = "Connect";
        }
    } else {
        console.log("No wallet detected.");
        connectButton.innerHTML = "Please install MetaMask";
    }
}

// Fund function
async function fund(): Promise<void> {
    const ethAmount: string = ethAmountInput.value;
    console.log(`Funding with ${ethAmount}...`);

    if (typeof window.ethereum !== 'undefined') {
        try {
            walletClient = createWalletClient({
                transport: custom(window.ethereum)
            });

            const [connectedAccount]: Address[] = await walletClient.requestAddresses();
            console.log("Wallet connected, Account:", connectedAccount);

            const currentChain: Chain = await getCurrentChain(walletClient);

            publicClient = createPublicClient({
                transport: custom(window.ethereum)
            });
            console.log("Public Client Initialized");

            console.log("Attempting simulation...");
            const { request } = await publicClient.simulateContract({
                address: contractAddress,
                abi: coffeeAbi,
                functionName: "fund",
                account: connectedAccount,
                chain: currentChain,
                value: parseEther(ethAmount),
            });
            console.log("Simulation successful, Prepared request:", request);

            const hash: Hash = await walletClient.writeContract(request);
            console.log("Transaction sent! Hash:", hash);

        } catch (error) {
            console.error("Transaction Error:", error);
        }
    } else {
        console.log("Please install MetaMask!");
        fundButton.innerHTML = "Please install MetaMask";
    }
}

// Get balance function
async function getBalance(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
        try {
            publicClient = createPublicClient({
                transport: custom(window.ethereum)
            });

            const balance: bigint = await publicClient.getBalance({
                address: contractAddress
            });

            const formattedBalance: string = formatEther(balance);
            console.log(`Contract Balance: ${formattedBalance} ETH`);
         
        } catch (error) {
            console.error("Error getting balance:", error);
        }
    } else {
        console.log("Please install MetaMask!");
        balanceButton.innerHTML = "Please install MetaMask";
    }
}

// Withdraw function
async function withdraw(): Promise<void> {
    console.log("Initiating withdrawal...");

    if (typeof window.ethereum !== 'undefined') {
        try {
            walletClient = createWalletClient({
                transport: custom(window.ethereum)
            });
            
            publicClient = createPublicClient({
                transport: custom(window.ethereum)
            });
            console.log("Public Client Initialized");

            const [connectedAccount]: Address[] = await walletClient.requestAddresses();
            console.log("Wallet connected, Account:", connectedAccount);

            const currentChain: Chain = await getCurrentChain(walletClient);

            console.log("Attempting simulation...");
            const { request } = await publicClient.simulateContract({
                address: contractAddress,
                abi: coffeeAbi,
                functionName: "withdraw",
                account: connectedAccount,
                chain: currentChain,
            });
            console.log("Simulation successful, Prepared request:", request);

            const hash: Hash = await walletClient.writeContract(request);
            console.log("Withdrawal transaction sent! Hash:", hash);

        } catch (error) {
            console.error("Transaction Error:", error);
        }
    } else {
        console.log("Please install MetaMask!");
        withdrawButton.innerHTML = "Please install MetaMask";
    }
}

async function getDonation(): Promise<void> {
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
            
            const walletAddress: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 

            const myBalance: bigint = await contract.read.getAddressToAmountFunded([walletAddress]);
            console.log(`My Donation: ${formatEther(myBalance)} ETH`);
            
        } catch (error) {
            console.error("Error getting donation:", error);
        }
    } else {
        console.log("Please install MetaMask!");
        donationButton.innerHTML = "Please install MetaMask";
    }
}

// Event listeners
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
donationButton.onclick = getDonation;