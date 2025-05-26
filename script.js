let currentUser = 'user'; // 'user', 'staff', 'admin'
let passwords = { staff: '1234', admin: 'admin' };

const savedPw = localStorage.getItem('passwords');
if (savedPw) {
  passwords = JSON.parse(savedPw);
} else {
  // Nếu chưa có mật khẩu trong localStorage, lưu mặc định vào
  localStorage.setItem('passwords', JSON.stringify(passwords));
}

const globalData = Array.from({ length: 4 }, (_, i) => 
({
  id: i + 1,
  name: `Sensor${i + 1}`,
  state: 'Stop',
  plan: 0,
  result: 0,
  set: 0,
  set_max: 9999,
  product: 0,
  cycle: 0,
  total: 0
}
));

//khoi tao websocket
var gateway = `ws://${window.location.hostname}:8080/`;
var websocket;

// Init web socket when the page loads
window.addEventListener('load', onload);

function onload(event) {
  initWebSocket();
  }

function initWebSocket() {
  console.log('Trying to open a WebSocket connection…');
  websocket = new WebSocket(gateway);
  websocket.onopen = onOpen;
  websocket.onclose = onClose;
  websocket.onmessage = onMessage;
}

function onOpen(event) {
  console.log('Connection opened');
  getReadings();
}

function getReadings(){
  websocket.send("getReadings");
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function onMessage(event) {
  console.log(event.data);
  let data = JSON.parse(event.data);
  if (Array.isArray(data)) {
    data.forEach(myObj => { 
      const sensor = globalData.find(d => d.id === myObj.id);
      if (sensor) {
        if(myObj.cmd === 0) { //xử lí việc RUN
          if(myObj.run === 1) {
            sensor.state = 1; 
            console.log("State", sensor.state);
            }
          if(myObj.run === 0) { 
            sensor.state = 0;
            console.log("State", sensor.state);
            }
        }
        if(myObj.cmd === 1) //xử lí việc RESET
        {
          if(myObj.reset === 1) {
            sensor.state = 0;
            console.log("State", sensor.state);
            }
        }
        if(myObj.cmd === 2) //xử lí cập nhật dữ liệu
        {
          Object.keys(myObj).forEach(key => {
          if (key !== 'id' && sensor.hasOwnProperty(key)) {
            sensor[key] = myObj[key];}
        })
        }         
      }
    });
    render();
  }
}

function switchTab(tab) {
  if (tab === 2 && currentUser !== 'admin') return alert("No access!");
  document.getElementById('tab1').classList.toggle('d-none', tab !== 1);
  document.getElementById('tab2').classList.toggle('d-none', tab !== 2);
  render();
}

function render() {
  const tab1 = document.getElementById('tab1');
  const tab2 = document.getElementById('tab2');
  tab1.innerHTML = '';
  tab2.innerHTML = '';  

  globalData.forEach(data => {
    //console.log(
    //   `Sensor: ${data.name}, Plan: ${data.plan}, Result: ${data.result}, Set: ${data.set}, Product: ${data.product}, Cycle: ${data.cycle}, Total: ${data.total}`
    // );
    const card = document.createElement('div');
    card.className = 'card p-3';
    const stateText = data.state === 1 ? 'RUN' : 'STOP';
    card.innerHTML = `
      <h5>${data.name}</h5>
      <p>ID: ${data.id}</p>
      <p>State: ${stateText}</p>
      <p>Plan: ${data.plan} | Result: ${data.result}</p>
      ${currentUser !== 'user' ? `
      <div class="d-flex justify-content-between">
        <button class="btn btn-sm btn-secondary" onclick="openSetting(${data.id})">Setting</button>
        <button id="runBtn-${data.id}" class="btn btn-sm btn-success" onclick="click_run(${data.id})">Run</button>
        <button id="resetBtn-${data.id}" class="btn btn-sm btn-danger" onclick="click_reset(${data.id})">Reset</button>
      </div>` : ''}
    `;
    tab1.appendChild(card);
  });

  if (currentUser === 'admin') {
  const detailSection = globalData.map(d =>
  {
    `<div class="card p-3 mb-3">
      <div>
        <div class="text-muted" style="font-size: 0.9em;">ID: ${d.id}</div>
        <h6 class="mb-0">${d.name}</h6>
      </div>
      <div class="mb-1">Plan: ${d.plan}</div>
      <div class="mb-1">Result: ${d.result}</div>
      <div class="mb-1">Cycle: ${d.cycle}</div>
      <div class="mb-1">Total: ${d.total}</div>
      <div class="mb-1">State: ${d.state}</div>
    </div>`
  }).join('');
  tab2.innerHTML = detailSection + renderTable();
  } 
}

function click_run(id) {
  if (websocket && websocket.readyState === WebSocket.OPEN){
    websocket.send(JSON.stringify({"id":id,"run":1}));
    alert('Run '+ id);

    const btn = document.getElementById(`runBtn-${id}`); 
    if(btn){
      btn.innerText = "Stop";
      btn.classList.remove("btn-success");
      btn.classList.add("btn-danger");
      btn.setAttribute("onclick", `click_stop(${id})`); // Gọi hàm stopbtn khi nhấn
    } 
  }
   else{
    alert('WebSocket is not connected. Please try again later.');
  } 
}



function click_stop(id) {
  if (websocket && websocket.readyState === WebSocket.OPEN){
    websocket.send(JSON.stringify({"id":id,"run":0}));
    alert('Stop '+ id);
    const btn = document.getElementById(`runBtn-${id}`);
    if(btn){
      btn.innerText = "Run";
      btn.classList.remove("btn-danger");
      btn.classList.add("btn-success");
      btn.setAttribute("onclick", `clickrun(${id})`); 
    } 
  }
   else{ 
    alert('WebSocket is not connected. Please try again later.');
  }  
}

function click_reset(id){
  if (websocket && websocket.readyState === WebSocket.OPEN){
    websocket.send(JSON.stringify({"id":id,"reset":1}));
    alert('Reset '+ id);
  }
  // Đặt giá trị `plan` và `result` về giá trị của `set`
  const data = globalData.find(d => d.id === id);
  if (data) {
    data.plan = 0;
    data.result = 0;
    render(); // Cập nhật lại giao diện sau khi thay đổi
  }
  else{ 
    alert('WebSocket is not connected. Please try again later.');
  }  
  document.innerHTML
}

function openSetting(id) {
  if (currentUser === 'user') return;
  const data = globalData.find(d => d.id === id);
  document.getElementById('modal-id').textContent = id;
  document.getElementById('nameInput').value = data.name;
  ['plan', 'result', 'set', 'product', 'cycle', 'total','set_max'].forEach(key => {
    document.getElementById(`modal-${key}`).value = data[key];
  });
  new bootstrap.Modal(document.getElementById('settingModal')).show();
}

function saveSettings() {
  const id = +document.getElementById('modal-id').textContent;
  const data = globalData.find(d => d.id === id);
  let setMax = +document.getElementById('modal-set_max').value || 0;
  if (setMax <= 0) setMax = 9999;
  data.set_max = setMax;
  data.name = document.getElementById('nameInput').value;
  ['plan', 'result', 'set', 'product', 'cycle', 'total'].forEach(key => {
    let val = +document.getElementById(`modal-${key}`).value || 0;
    if (val < 0) val = 0;
    if ((key === 'plan' || key === 'result') && val>data.set_max) val = data.set_max; 
    data[key] = val;
  });
  bootstrap.Modal.getInstance(document.getElementById('settingModal')).hide();
  render();
}

function renderTable() {
  const rows = globalData.map(d =>
    `<tr><td>${d.name}</td><td>${d.id}</td><td>${d.state}</td><td>${d.plan}</td><td>${d.result}</td><td>${d.cycle}</td><td>${d.total}</td></tr>`
  ).join('');
  return `<table class="table mt-4"><thead><tr><th>Name</th><th>ID</th><th>State</th><th>Plan</th><th>Result</th><th>Cycle</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function toggleLoginModal() {
  new bootstrap.Modal(document.getElementById('loginModal')).show();
}

function submitLogin() {
  const pw = document.getElementById('login-password').value;
  if (pw === passwords.staff) {
    currentUser = 'staff';
    alert('Đăng nhập staff thành công!');
  } else if (pw === passwords.admin) {
    currentUser = 'admin';
    alert('Đăng nhập admin thành công!');
  } else {
    alert('Sai mật khẩu!');
    return;
  }
  render();
  bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
}

function changePassword() {
  const pw = document.getElementById('login-password').value;
  if (currentUser === 'staff' || currentUser === 'admin') {
    passwords[currentUser] = pw;
    localStorage.setItem('passwords', JSON.stringify(passwords));
    console.log('Mật khẩu mới:', pw);
    alert("Password changed");
  }
}

function logout() {
  currentUser = 'user';
  render();
  bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
}

render();
