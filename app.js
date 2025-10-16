(function(){
const app = document.getElementById('app');
const STORAGE = 'yushfinance_v3_4_state';
const RUPEE = 'रू';
function uid(){return Math.random().toString(36).slice(2,9);}
function nowISO(){return new Date().toISOString();}
function fmt(n){return RUPEE+' '+Number(n).toLocaleString();}

const demo = {
  accounts: [
    {id:'a_cash',name:'Cash',opening:10000},
    {id:'a_bank',name:'Bank',opening:50000},
    {id:'a_esewa',name:'eSewa',opening:2000}
  ],
  transactions: [
    {id:uid(),date:nowISO(),desc:'Initial Salary',from:null,to:'a_cash',amount:30000,note:'Demo',category:'Salary'}
  ]
};

function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE))||null }catch(e){return null} }
function save(s){ localStorage.setItem(STORAGE,JSON.stringify(s)); }

let state = load() || demo;
if(!state.accounts) state.accounts = demo.accounts;
if(!state.transactions) state.transactions = demo.transactions;

const USER = {email:'admin@yush.com', password:'1234'};
function initNav(){document.querySelectorAll('.icon-btn').forEach(b=>{b.onclick=()=>{const page=b.getAttribute('data-nav');if(page){location.hash=page;render();}}})}

function balances(){ const res={}; state.accounts.forEach(a=>res[a.id]=Number(a.opening||0)); state.transactions.forEach(t=>{if(t.to) res[t.to]=(res[t.to]||0)+Number(t.amount||0); if(t.from) res[t.from]=(res[t.from]||0)-Number(t.amount||0);}); return res;}
function header(){ return `<div class="header"><div style="display:flex;gap:12px;align-items:center"><div class="logo">Y</div><div><div style="font-weight:700">YushFinance</div><div class="small">v3.4 Final</div></div></div><div><button id="logoutBtn" class="btn ghost">Logout</button></div></div>`; }
function footer(active){return `<div class="footer">
<button class="icon-btn ${active==='dashboard'?'active':''}" data-nav="dashboard" aria-label="Home">🏠</button>
<button class="icon-btn ${active==='accounts'?'active':''}" data-nav="accounts" aria-label="Accounts">💰</button>
<button class="icon-btn ${active==='transactions'?'active':''}" data-nav="transactions" aria-label="Transactions">🔁</button>
<button class="icon-btn ${active==='ledger'?'active':''}" data-nav="ledger" aria-label="Ledger">📘</button>
</div>`;}

function viewLogin(){
  app.innerHTML=`<div class="app"><div class="card" style="max-width:540px;margin:40px auto"><h2>YushFinance v3.4</h2>
  <div class="small">Login</div>
  <input id="email" class="input" placeholder="Email" />
  <input id="pwd" class="input" type="password" placeholder="Password" />
  <div style="height:10px"></div>
  <div style="display:flex;gap:8px"><button id="loginBtn" class="btn">Login</button><button id="demoBtn" class="btn ghost">Use Demo</button></div>
  <div id="loginMsg" class="small" style="margin-top:8px">Use admin@yush.com / 1234</div>
  </div></div>`;
  document.getElementById('loginBtn').onclick=()=>{ const e=document.getElementById('email').value.trim(); const p=document.getElementById('pwd').value; if(e===USER.email&&p===USER.password){ location.hash='dashboard'; render();} else {document.getElementById('loginMsg').textContent='Invalid credentials';}};
  document.getElementById('demoBtn').onclick=()=>{save(demo); state=JSON.parse(JSON.stringify(demo)); location.hash='dashboard'; render();};
}

function viewDashboard(){
  const b=balances();
  const total=Object.values(b).reduce((s,v)=>s+v,0);
  let income=0,expense=0;
  state.transactions.forEach(t=>{if(t.to&&!t.from) income+=Number(t.amount||0); if(t.from) expense+=Number(t.amount||0);});
  let html='<div class="app"><div class="card">'+header()+'</div>';
  html+='<div class="card"><h3>Dashboard</h3>';
  html+=`<div style="display:flex;gap:12px;align-items:center"><div><div class="small">Total Balance</div><div style="font-weight:700;font-size:20px;margin-top:6px">${fmt(total)}</div></div><div style="margin-left:18px"><div class="small">This month</div><div>Income: ${fmt(income)}</div><div>Expense: ${fmt(expense)}</div></div></div>`;
  html+='<div style="height:12px"></div>';
  html+='<h4>Accounts</h4><table class="table"><tr><th>Name</th><th>Opening</th><th>Balance</th><th></th></tr>';
  state.accounts.forEach(a=>{html+=`<tr><td>${a.name}</td><td>${fmt(a.opening)}</td><td>${fmt(b[a.id]||0)}</td><td><button class="btn ghost" data-edit="${a.id}">Edit</button></td></tr>`;});
  html+='</table></div>';
  html+='<div class="card"><h4>Recent Transactions</h4>';
  if(state.transactions.length===0) html+='<div class="small">No transactions yet</div>'; else {
    html+='<div class="list">';
    state.transactions.slice(0,20).forEach(t=>{
      html+=`<div class="tx-item"><div class="tx-left"><div style="font-weight:700">${t.desc}</div><div class="small">${t.category||''} • ${t.note||''}</div></div>
      <div style="text-align:right"><div class="tx-amount">${fmt(t.amount)}</div>
      <div class="tx-actions small">
      <button class="btn ghost" data-edit="${t.id}">✏️</button>
      <button class="btn ghost" data-del="${t.id}">🗑️</button>
      </div></div></div>`;
    });
    html+='</div>';
  }
  html+='</div>';
  html+=footer('dashboard'); html+='</div>';
  app.innerHTML=html; initNav();
  document.querySelectorAll('[data-edit]').forEach(btn=> btn.onclick=()=>{ const id=btn.getAttribute('data-edit'); const tx=state.transactions.find(x=>
