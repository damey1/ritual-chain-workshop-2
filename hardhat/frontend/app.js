const connectBtn = document.getElementById('connect');
const loadBtn = document.getElementById('load');
const statusEl = document.getElementById('status');
const marketsEl = document.getElementById('markets');

let provider, signer, contract;

function setStatus(txt){ statusEl.textContent = txt }

connectBtn.onclick = async () => {
  if (!window.ethereum) return setStatus('No Web3 wallet found (install MetaMask)');
  await window.ethereum.request({method:'eth_requestAccounts'});
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  setStatus('Wallet connected: ' + (await signer.getAddress()).slice(0,8));
}

loadBtn.onclick = async () => {
  const addr = document.getElementById('contractAddress').value.trim();
  if (!addr) return setStatus('Enter contract address');
  if (!provider) provider = new ethers.providers.Web3Provider(window.ethereum || window.location.host);

  const abi = [
    'function marketCount() view returns (uint256)',
    'function getMarkets() view returns (tuple(uint256 id,address creator,string question,string oracleUrl,string jsonPath,uint256 target,uint8 comparator,uint64 closeBlock,uint64 resolveBlock,uint256 scheduleId,uint256 totalYes,uint256 totalNo,uint8 state,uint8 outcome,uint8 attempts,uint256 observedValue,string invalidReason)[])',
    'function bet(uint256,bool) payable',
    'function claimWinnings(uint256)',
    'function claimRefund(uint256)'
  ];

  contract = new ethers.Contract(addr, abi, signer || provider);
  setStatus('Contract loaded: ' + addr);
  await renderMarkets();
}

async function renderMarkets(){
  marketsEl.innerHTML = '';
  try{
    const markets = await contract.getMarkets();
    for(const m of markets){
      const div = document.createElement('div'); div.className='market';
      div.innerHTML = `<strong>#${m.id}</strong> <div class="muted">${m.question}</div>`;
      const row = document.createElement('div'); row.className='row';
      const yesBtn = document.createElement('button'); yesBtn.textContent='Bet YES (0.01)';
      yesBtn.onclick = async ()=>{ await txBet(m.id, true) };
      const noBtn = document.createElement('button'); noBtn.textContent='Bet NO (0.01)';
      noBtn.onclick = async ()=>{ await txBet(m.id, false) };
      const claimWin = document.createElement('button'); claimWin.textContent='Claim Winnings';
      claimWin.onclick = async ()=>{ await txClaimWin(m.id) };
      const claimRef = document.createElement('button'); claimRef.textContent='Claim Refund';
      claimRef.onclick = async ()=>{ await txClaimRef(m.id) };
      row.appendChild(yesBtn); row.appendChild(noBtn); row.appendChild(claimWin); row.appendChild(claimRef);
      div.appendChild(row);
      marketsEl.appendChild(div);
    }
  }catch(e){ setStatus('Error reading markets: ' + (e.message||e)) }
}

async function txBet(id, isYes){
  try{
    const tx = await contract.bet(id, isYes, {value: ethers.utils.parseEther('0.01')});
    setStatus('Sending bet...');
    await tx.wait();
    setStatus('Bet confirmed');
    await renderMarkets();
  }catch(e){ setStatus('Bet failed: ' + (e.data?.message || e.message || e)) }
}

async function txClaimWin(id){
  try{ const tx = await contract.claimWinnings(id); setStatus('Claiming...'); await tx.wait(); setStatus('Claimed'); }catch(e){ setStatus('Claim failed: ' + (e.data?.message || e.message || e)) }
}

async function txClaimRef(id){
  try{ const tx = await contract.claimRefund(id); setStatus('Claiming refund...'); await tx.wait(); setStatus('Refunded'); }catch(e){ setStatus('Refund failed: ' + (e.data?.message || e.message || e)) }
}
