// YushFinance v3.5 Final - Fully Functional JS

(function(){
const app=document.getElementById('app');
const STORAGE='yushfinance_v3_5_state';
const RUPEE='रू';

function uid(){return Math.random().toString(36).slice(2,9);}
function nowISO(){return new Date().toISOString();}
function fmt(n){return RUPEE+' '+Number(n||0).toLocaleString();}

// Default demo data
const demo={
accounts:[
{id:'a_cash',name:'Cash',opening:10000},
{id:'a_bank',name:'Bank',opening:50000},
{id:'a_esewa',name:'eSewa',opening:2000}
],
transactions:[
{id:uid(),date:nowISO(),desc:'Initial Salary',from:null,to:'a_cash',amount:30000,note:'Demo',category:'Salary'}
]
};

// Load/save localStorage
function load(){try{return JSON.parse(localStorage.getItem(STORAGE))||null}catch(e){return null}}
function save(s){localStorage.setItem(STORAGE,JSON.stringify(s));}
let state=load()||JSON.parse(JSON.stringify(demo));
if(!state.accounts) state.accounts=demo.accounts;
if(!state.transactions) state.transactions=demo.transactions;

// Default user
const USER={email:'admin@yush.com',password:'1234'};

// Helper to compute balances
function balances(){
const res={};
state.accounts.forEach(a=>res[a.id]=Number(a.opening||0));
state.transactions.forEach(t=>{
if(t.to) res[t.to]=(res[t.to]||0)+Number(t.amount||0);
if(t.from) res[t.from]=(res[t.from]||0)-Number(t.amount||0);
});
return res;
}

// Header & Footer
function header(){return `<div class="header"><div style="display:flex;gap:12px;align-items:center">
<div class="logo">Y</div><div><div style="font-weight:700">YushFinance</div><div class="small">v3.5 Final</div></div>
</div><div><button id="logoutBtn" class="btn ghost">Logout</button></div></div>`;}

function footer(active){
return `<div class="footer">
<button class="icon-btn ${active==='dashboard'?'active':''}" data-nav="dashboard">🏠</button>
<button class="icon-btn ${active==='accounts'?'active':''}" data-nav="accounts">💰</button>
<button class="icon-btn ${active==='transactions'?'active':''}" data-nav="transactions">🔁</button>
<button class="icon-btn ${active==='ledger'?'active':''}" data-nav="ledger">📘</button>
</div>`;
}

// Navigation init
function initNav(){
document.querySelectorAll('.icon-btn').forEach(b=>{
b.onclick=()=>{ const page=b.getAttribute('data-nav'); if(page){ location.hash=page; } }
});
const logoutBtn=document.getElementById('logoutBtn');
if(logoutBtn) logoutBtn.onclick=()=>{ location.hash=''; render(); }
}

// ----------------- Views -----------------

// Login Page
function viewLogin(){
app.innerHTML=`<div class="app"><div class="card" style="max-width:540px;margin:40px auto">
<h2>YushFinance v3.5</h2>
<div class="small">Login</div>
<input id="email" class="input" placeholder="Email" />
<input id="pwd" class="input" type="password" placeholder="Password" />
<div style="height:10px"></div>
<div style="display:flex;gap:8px"><button id="loginBtn" class="btn">Login</button>
<button id="demoBtn" class="btn ghost">Use Demo</button></div>
<div id="loginMsg" class="small" style="margin-top:8px">Use admin@yush.com / 1234</div>
</div></div>`;

document.getElementById('loginBtn').onclick=()=>{
const e=document.getElementById('email').value.trim();
const p=document.getElementById('pwd').value;
if(e===USER.email && p===USER.password){location.hash='dashboard';render();}
else{document.getElementById('loginMsg').textContent='Invalid credentials';}
};

document.getElementById('demoBtn').onclick=()=>{save(demo);state=JSON.parse(JSON.stringify(demo));location.hash='dashboard';render();}
}

// Dashboard
function viewDashboard(){
const b=balances();
const total=Object.values(b).reduce((s,v)=>s+v,0);
let income=0,expense=0;
state.transactions.forEach(t=>{
if(t.to && !t.from) income+=Number(t.amount||0);
if(t.from) expense+=Number(t.amount||0);
});

let html='<div class="app"><div class="card">'+header()+'</div>';
html+='<div class="card"><h3>Dashboard</h3>';
html+=`<div style="display:flex;gap:12px;align-items:center"><div><div class="small">Total Balance</div>
<div style="font-weight:700;font-size:20px;margin-top:6px">${fmt(total)}</div></div>
<div style="margin-left:18px"><div class="small">This month</div><div>Income: ${fmt(income)}</div><div>Expense: ${fmt(expense)}</div></div></div>`;

html+='<div style="height:12px"></div>';
html+='<h4>Accounts</h4><table class="table"><tr><th>Name</th><th>Opening</th><th>Balance</th><th></th></tr>';
state.accounts.forEach(a=>{
html+=`<tr><td>${a.name}</td><td>${fmt(a.opening)}</td><td>${fmt(b[a.id]||0)}</td>
<td><button class="btn ghost" data-editacc="${a.id}">Edit</button></td></tr>`;
});
html+='</table></div>';
html+=footer('dashboard');
html+='</div>';
app.innerHTML=html;
initNav(); initEditAccount(); initTxActions(); initAddTransaction();
}

// Accounts Page
function viewAccounts(){
const b=balances();
let html='<div class="app"><div class="card">'+header()+'</div>';
html+='<div class="card"><h3>Accounts</h3><table class="table"><tr><th>Name</th><th>Opening</th><th>Balance</th><th></th></tr>';
state.accounts.forEach(a=>{
html+=`<tr><td>${a.name}</td><td>${fmt(a.opening)}</td><td>${fmt(b[a.id]||0)}</td>
<td><button class="btn ghost" data-editacc="${a.id}">Edit</button></td></tr>`;
});
html+='</table>';
html+='<div style="margin-top:12px;"><button class="btn" id="newAccBtn">Create New Account</button></div>';
html+=footer('accounts')+'</div>';
app.innerHTML=html;
initNav(); initEditAccount(); initNewAccount();
}

// Transactions Page
function viewTransactions(){
let html='<div class="app"><div class="card">'+header()+'</div>';
html+='<div class="card"><h3>Transactions</h3>';
if(state.transactions.length===0) html+='<div class="small">No transactions yet</div>';
else{
html+='<div class="list">';
state.transactions.slice().reverse().forEach(t=>{
html+=`<div class="tx-item"><div class="tx-left"><div style="font-weight:700">${t.desc}</div>
<div class="small">${t.category||''} • ${t.note||''}</div></div>
<div style="text-align:right"><div class="tx-amount">${fmt(t.amount)}</div>
<div class="tx-actions small">
<button class="btn ghost" data-edittx="${t.id}">✏️</button>
<button class="btn ghost" data-deltx="${t.id}">🗑️</button>
</div></div></div>`;
});
html+='</div>';
}
html+='<div style="margin-top:12px;"><button class="btn" id="addTxBtn">Add Transaction</button></div>';
html+=footer('transactions')+'</div>';
app.innerHTML=html;
initNav(); initTxActions(); initAddTransaction();
}

// Ledger Page
function viewLedger(){
const b=balances();
let html='<div class="app"><div class="card">'+header()+'</div>';
html+='<div class="card"><h3>Ledger</h3>';
state.accounts.forEach(a=>{
html+=`<h4>${a.name}</h4><table class="table"><tr><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th>Note</th></tr>`;
state.transactions.filter(t=>t.to===a.id || t.from===a.id).forEach(t=>{
html+=`<tr><td>${t.date.split('T')[0]}</td><td>${t.desc}</td>
<td>${t.from===a.id?fmt(t.amount):''}</td>
<td>${t.to===a.id?fmt(t.amount):''}</td>
<td>${t.note||''}</td></tr>`;
});
html+='</table>';
});
html+=footer('ledger')+'</div>';
app.innerHTML=html;
initNav();
}

// ----------------- Edit Accounts -----------------
function initEditAccount(){
document.querySelectorAll('[data-editacc]').forEach(btn=>{
btn.onclick=()=>{
const id=btn.getAttribute('data-editacc');
const acc=state.accounts.find(a=>a.id===id);
const val=prompt(`Edit opening for ${acc.name}`, acc.opening);
if(val!==null){acc.opening=Number(val); save(state); render();}
};
});
}

function initNewAccount(){
const btn=document.getElementById('newAccBtn');
if(!btn) return;
btn.onclick=()=>{
const name=prompt('New Account Name','');
if(!name) return;
const opening=Number(prompt('Opening balance','0')||0);
state.accounts.push({id:uid(),name,opening});
save(state); render();
}
}

// ----------------- Transactions -----------------
function initTxActions(){
document.querySelectorAll('[data-deltx]').forEach(btn=>{
btn.onclick=()=>{
const id=btn.getAttribute('data-deltx');
if(confirm('Delete this transaction?')){state.transactions=state.transactions.filter(t=>t.id!==id); save(state); render();}
};
});
document.querySelectorAll('[data-edittx]').forEach(btn=>{
btn.onclick=()=>{
const id=btn.getAttribute('data-edittx');
const tx=state.transactions.find(t=>t.id===id);
const val=prompt('Edit amount', tx.amount);
if(val!==null){tx.amount=Number(val); save(state); render();}
};
});
}

function initAddTransaction(){
const btn=document.getElementById('addTxBtn');
if(!btn) return;
btn.onclick=()=>{
const desc=prompt('Description','');
if(!desc) return;
const amt=prompt('Amount','0');
if(!amt) return;
const cat=prompt('Category (Salary, Shopping, Rent, etc.)','Misc');
const note=prompt('Note (optional)','');
const accPrompt=prompt('Account (Cash, Bank, eSewa) leave blank for quick income/expense','Cash');
let accId=state.accounts.find(a=>a.name.toLowerCase()===accPrompt.toLowerCase())?.id || null;
state.transactions.push({id:uid(),date:nowISO(),desc,from:null,to:accId||null,amount:Number(amt),category:cat,note});
save(state); render();
};
}

// ----------------- Render -----------------
function render(){
const page=location.hash.replace('#','');
if(!page) return viewLogin();
switch(page){
case 'dashboard': viewDashboard(); break;
case 'accounts': viewAccounts(); break;
case 'transactions': viewTransactions(); break;
case 'ledger': viewLedger(); break;
default: viewDashboard(); break;
}
}

window.addEventListener('hashchange',render);
render();

})();
