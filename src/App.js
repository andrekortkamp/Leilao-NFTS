import React, { useState } from 'react'
import {ethers} from 'ethers'
import abi from './abi.json'
import './App.css'

const App = () => {

	const [walletAddress, setWalletAddress] = useState("");
	const [currentSeller, setCurrentSeller] = useState(null);
	const [currentBidder, setCurrentBidder] = useState(null);
	const [currentBid, setCurrentBid] = useState(null);
	const [currentTime, setCurrentTime] = useState(null);
	const [currentStart, setCurrentStart] = useState(null);
	const [currentEnd, setCurrentEnd] = useState(null);

	const provider = new ethers.providers.Web3Provider(window.ethereum)
	const ERC20_ABI = abi;
	
	const address = '0xb3e561AD2Ca8C2039e2133FcEC446a8F88a170C3' 

	const contract = new ethers.Contract(address, ERC20_ABI, provider)

  	async function requestAccount() {

    	if (typeof window.ethereum !== 'undefined') {
			try {
				await window.ethereum.request({ method: "eth_requestAccounts" });
			} catch (error) {
			console.log(error);
			}
			const accounts = await window.ethereum.request({ method: "eth_accounts" });
			setWalletAddress(accounts);
		} else {
		alert('MetaMask not detected');
		}
  	}

	  async function start() {
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const contract = new ethers.Contract(address, ERC20_ABI, signer)
		const transactionResponse = await contract.start()
		await transactionResponse.wait()
	}

	async function bid() {  
		const ethAmount = document.getElementById("ethAmount").value
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const contract = new ethers.Contract(address, ERC20_ABI, signer)
		const transactionResponse = await contract.bid({ value: ethers.utils.parseEther(ethAmount) })
		await transactionResponse.wait()
	}
	

	async function end() { 
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const contract = new ethers.Contract(address, ERC20_ABI, signer)
		const transactionResponse = await contract.end()
		await transactionResponse.wait()
	}

	async function withdraw() { 
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const contract = new ethers.Contract(address, ERC20_ABI, signer)
		const transactionResponse = await contract.withdraw()
		await transactionResponse.wait()
	}

	const getSeller = async () => {
		let val = await contract.seller();
		setCurrentSeller(val);
	}

	const getBidder = async () => {
		let val = await contract.highestBidder();
		setCurrentBidder(val);
	}

	const getBid = async () => {
		let val = await contract.highestBid();
		setCurrentBid(ethers.utils.formatEther(val));
	}

	const getTimer = async () => {
		let val = await contract.timerAuction();
		setCurrentTime(val/60);
	}

	const getStart = async () => {
		const val = await contract.started();
		console.log(val)
		setCurrentStart(val)
		
	}

	const getEnd = async () => {
		let val = await contract.ended();
		console.log(val)
		setCurrentEnd(val);
	}

  return (
    <div className="App">
        <div>
			<button onClick={requestAccount}>Request Account</button>
        	<h3>Wallet Address: {walletAddress}</h3>
		</div>
		<div>
			<button onClick={start}>Começar Leilao</button>
		</div>
		<div>
    		<input id="ethAmount" placeholder="Exemplo: 0.1" />
			<button onClick={bid}>Apostar</button>
		</div>
		<div>
			<button onClick={end}>Terminar Leilao</button>
		</div>
		<div>
			<button onClick={withdraw}>Retirar Fundos</button>
		</div><br></br>


		
		<div>
			<button onClick={getSeller}>Vendedor</button>
			<h1>{currentSeller}</h1>
		</div>
		<div>
			<button onClick={getBidder}>Atual Campeão</button>
			<h1>{currentBidder}</h1>
		</div>
		<div>
			<button onClick={getBid}>Maior Aposta</button>
			<h1>{currentBid}</h1>
		</div>
		<div>
			<button onClick={getTimer}>Duração</button>
			<h1>{currentTime}</h1>
		</div>
		<div>
			<button onClick={getStart}>Inicio</button>
			<h1>{currentStart ? 'Iniciado' : 'Não iniciado'}</h1>
		</div>
		<div>
			<button onClick={getEnd}>Fim do Leilao</button>
			<h1>{currentEnd ? 'Terminou' : 'Não terminou'}</h1>
		</div>
    </div>
  );
}

export default App;
