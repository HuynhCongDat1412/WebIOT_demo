let currentUser = 'user'; // 'user', 'staff', 'admin'
let passwords = { staff: '1234', admin: 'admin' };
const savedPw = localStorage.getItem('passwords');
let flag = 1;
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
  plan: [160,2],
  result: [161,3],
  set: [162,4],
  set_max: 9999,
  product: 0,
  cycle: [163,5],
  total: [164,6],
  state: [165,7]
}
));

//khoi tao websocket
var gateway = `ws://${window.location.hostname}:8080/`;
var websocket;

// Init web socket when the page loads
window.addEventListener('load', onload);

function onload(event) {
  initWebSocket();
  initChart();
  switchTab(1);
    render();

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
  setInterval(() => {
  }, 500);
}

function getReadings(){
  websocket.send("getReadings");
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function render() {
  if (!document.getElementById('tab1').classList.contains('d-none')) {
    renderTab1();
  }
  if (!document.getElementById('tab2').classList.contains('d-none') && currentUser === 'admin') {
    renderTab2();
  }
}

function renderTab1() {
  const cardContainer = document.getElementById('card-container');
  cardContainer.innerHTML = '';
  globalData.forEach(data => {
    //console.log(  
    //   `Sensor: ${data.name}, Plan: ${data.plan}, Result: ${data.result}, Set: ${data.set}, Product: ${data.product}, Cycle: ${data.cycle}, Total: ${data.total}`
    // );
    const card = cardGen(data);
    cardContainer.appendChild(card);
  }); 
      updateChart();}

function renderTab2() {
  const tab2 = document.getElementById('tab2');
  tab2.innerHTML = '';
  const detailSection = globalData.map(d =>
    `<div class="card p-3 mb-3">
      <div>
        <div class="text-muted" style="font-size: 0.9em;">ID: ${d.id}</div>
        <h6 class="mb-0">${d.name}</h6>
      </div>
      <div class="mb-1">Plan: ${d.plan[1]}</div>
      <div class="mb-1">Result: ${d.result[1]}</div>
      <div class="mb-1">Plan|Result Set: ${d.set[1]}</div>
      <div class="mb-1">Cycle: ${d.cycle[1]}</div>
      <div class="mb-1">Total: ${d.total[1]}</div>
      <div class="mb-1">State: ${d.state[1]}</div>
    </div>`
  ).join('');
  tab2.innerHTML = detailSection + renderTable();
}

function cardGen(data){
  const card = document.createElement('div');
  const stateText = data.state === 1 ? 'RUN' : 'STOP';
  card.innerHTML = `
  <div class=" card2 col-sm-12 col-md-6 col-lg-4" style="width:100%">
    <div class="card-header2 row bg-warning">
      <div class="col">
        <div class="row">
          <div class="col" style="position: relative; left: 20px;">
            <p>ID: ${data.id}/0</p>
          </div>
          <div class="col" style="position: relative; left: 20px;">
            <p>State: ${stateText}</p>  
          </div>
        </div>
        <div class="row">
          <div class="col" style="text-align: center">
            <h4 id="sensor_name">${data.name}</h4>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-body01 ">
      <div class="card-body01 row">
        <div class="col text-muted">
          <!-- Plan display -->
          Plan: 
        </div>
        <div class="col">
          <h3 id="regs0_1">${data.plan[1]}</h3>
        </div>
      </div>
      <div class="card-body01 row">
        <div class="col text-muted">
          <!-- Result display -->
          Result: 
        </div>
        <div class="col">
          <h3 id="regs1_1">${data.result[1]}</h3>
        </div>
      </div>
    </div>
      <div class="row d-flex justify-content-between">
        <div class="col-4 align-self-center align-items-center">
          <!-- Setting button -->
          <button class="btn btn-warning btn-secondary" onclick="openSetting(${data.id})">Setting</button>
        </div>
        <div class="col-4 align-self-center align-items-center">
          <!-- Run button -->
          <button type="button" id="runBtn-${data.id}" class="btn btn-warning btn-${data.state[1] === 1 ? 'danger' : 'success'}" onclick="${data.state[1] === 1 ? `click_stop(${data.id})` : `click_run(${data.id})`}">Run</button>
        </div>
        <div class="col-4 align-self-center align-items-center">
          <!-- Reset button -->
          <button id="resetBtn-${data.id}" class="btn btn-warning" onclick="click_reset(${data.id})">Reset</button>
        </div>
      </div>

  </div>
    `;
  return card;
}

function mapData(data) {
  let arrIndex = 0;
  let arrIndex2 = 0;

  let rawDataArray = [];
  let rawDataArrayName = [];

  data.forEach(dataObj =>{
    // let firstKey = Object.keys(dataObj)[0];
    // let value = Object.values(dataObj)[0];
    // console.log("first key: "+firstKey);
    // console.log("first key value: "+value);
    rawDataArray[arrIndex] = Object.values(dataObj)[0];
    rawDataArrayName[arrIndex2] = Object.keys(dataObj)[0];
    arrIndex ++;
    arrIndex2 ++;
    });    
  // console.log("array value: ", rawDataArray);
  // console.log("array value: ", rawDataArrayName);


  let idIndex = 1;
  globalData.forEach(globalDataObj=>
  { 
    let keyIndex = 0;
    Object.keys(globalDataObj).forEach(key =>{ 
      if (key !== "id" && key !== "name" && key !== "product" && key !== "set_max"){
        globalDataObj[key][1] = rawDataArray[keyIndex + (idIndex-1)*6];
        globalDataObj[key][0] = rawDataArrayName[keyIndex + (idIndex-1)*6];
        keyIndex++;}}
    );
    idIndex ++;
  });

  //console.log("global: ", globalData);
  }
function onMessage(event) {
  let data = JSON.parse(event.data);
  console.log(data);
  let rawData = JSON.parse(event.data);
  let masterData = rawData.masterData;
  // console.log("masterData :",masterData);
  mapData(masterData);
  //----------------------------------------------------------------old version

  if (Array.isArray(data)) {
    data.forEach(myObj => { 
      const sensor = globalData.find(d => d.id === myObj.id);
      if (sensor) {
        if(myObj.cmd === 0) { //xử lí việc RUN
          const btn = document.getElementById(`runBtn-${myObj.id}`);
          if(myObj.run === 1) {
            sensor.state = 1; 
            alert('Run '+myObj.id);
          }
          else if(myObj.run === 0) { 
            sensor.state = 0;
            alert('Run '+ myObj.id);
          }
        }
        else if(myObj.cmd === 1) //xử lí việc RESET
        {
          if(myObj.reset === 1) {
            sensor.state = 0;
            console.log("State", sensor.state);
            sensor.plan = 0;
            sensor.result = 0;
          }
        }
        else if(myObj.cmd === 2) //xử lí cập nhật dữ liệu
        {
          Object.keys(myObj).forEach(key => {
          if (key !== 'id' && sensor.hasOwnProperty(key)) {
            sensor[key] = myObj[key];
            // sensor.plan = Math.floor(Math.random() * 1000);   // ví dụ chart
            // sensor.result = Math.floor(Math.random() * 1000); // ví dụ chart
          }
        })
        }         
      }});
    render();
  }
}

function switchTab(tab) {
  if (tab === 2 && currentUser !== 'admin') return alert("No access!");
  document.getElementById('tab1').classList.toggle('d-none', tab !== 1);
  document.getElementById('tab2').classList.toggle('d-none', tab !== 2);
  render();
}

function click_run(id) {
  if (websocket && websocket.readyState === WebSocket.OPEN){
    const dataObj = globalData.find(d => d.id === id);
    websocket.send(JSON.stringify({"cmnd":"setModbusValue","id":1,"type":"word","address":parseInt(dataObj.state[0]),"value":"1"}));
    console.log(JSON.stringify({"cmnd":"setModbusValue","id":1,"type":"word","address":parseInt(dataObj.state[0]),"value":"1"}));
    
    //runtostop(id);
  }
   else{
    alert('WebSocket is not connected. Please try again later.');
  } 
}

function click_stop(id) {
  if (websocket && websocket.readyState === WebSocket.OPEN){
    const dataObj = globalData.find(d => d.id === id);    
    websocket.send(JSON.stringify({"cmnd":"setModbusValue","id":1,"type":"word","address":parseInt(dataObj.state[0]),"value":"0"}));
    console.log(JSON.stringify({"cmnd":"setModbusValue","id":1,"type":"word","address":parseInt(dataObj.state[0]),"value":"0"}));
    

    //stoptorun(id);
  }
   else{ 
    alert('WebSocket is not connected. Please try again later.');
  }  
}


function click_reset(id){
  const dataObj = globalData.find(d => d.id === id); 
  console.log("plan id: ", dataObj.plan[0]);
  console.log("result id: ", dataObj.result[0]);

  if (websocket && websocket.readyState === WebSocket.OPEN){    
    websocket.send(JSON.stringify({"cmnd":"setModbusValue","id":1,"type":"word","address":parseInt(dataObj.plan[0]),"value":"0"}));
    websocket.send(JSON.stringify({"cmnd":"setModbusValue","id":1,"type":"word","address":parseInt(dataObj.result[0]),"value":"0"}));
    console.log(JSON.stringify({"cmnd":"setModbusValue","id":1,"type":"word","address":parseInt(dataObj.state[0]),"value":"0"}));
  }
}

function openSetting(id) {
  if (currentUser === 'user') return;
  const data = globalData.find(d => d.id === id);
  const script = `
    <p>ID: <span id="modal-id"></span></p>
    <label for="nameInput">Change name:</label>
    <input id="nameInput" class="form-control mb-3">

    <div class="form-group">
      <label>Plan</label>
      <input class="form-control" id="modal-plan-${id}" value='${data.plan[1]}' onchange="setValue(${id}, 'plan')">

      <label>Result</label>
      <input class="form-control" id="modal-result-${id}" value='${data.result[1]}' onchange="setValue(${id}, 'result')">

      <label>Set Max</label>
      <input class="form-control" id="modal-set_max-${id}" value='${data.set_max}' onchange="setValue(${id}, 'set_max')">

      <label>Plan/Result Set</label>
      <input class="form-control" id="modal-set-${id}" value='${data.set[1]}' onchange="setValue(${id}, 'set')">

      <label>Product</label>
      <input class="form-control" id="modal-product-${id}" value='${data.product}' onchange="setValue(${id}, 'product')">

      <label>Cycle Time</label>
      <input class="form-control" id="modal-cycle-${id}" value='${data.cycle[1]}' onchange="setValue(${id}, 'cycle')">

      <label>Total Plan</label>
      <input class="form-control" id="modal-total-${id}" value='${data.total[1]}' onchange="setValue(${id}, 'total')">
    </div>
  `;
  document.getElementById('modal-body').innerHTML = script;

  document.getElementById('modal-id').textContent = id;
  document.getElementById('nameInput').value = data.name;
  // ['plan', 'result', 'set', 'product', 'cycle', 'total','set_max'].forEach(key => {
  //   document.getElementById(`modal-${key}`).value = data[key];
  // });
  // document.getElementById.addEventListener('on');
  new bootstrap.Modal(document.getElementById('settingModal')).show();
}


function setValue(dataId,school){
  // const input = document.getElementById(`modal-${key}-${dataId}`);
  const value = document.getElementById(`modal-${school}-${dataId}`).value;
  const data = globalData.find(d => d.id === dataId);
  const address = parseInt(data[school][0]);
  // const address = document.getElementById(`modal-${school}-${dataId}`).value[0];
  console.log("data sent",JSON.stringify({"cmnd":"setModbusValue","id":dataId,"type":"word","address":address,"value":value}))
  websocket.send(JSON.stringify({"cmnd":"setModbusValue","id":dataId,"type":"word","address":address,"value":value}));
}
function saveSettings() {
  if (websocket && websocket.readyState !== WebSocket.OPEN) {
    alert('WebSocket is not connected. Please try again later.');
    return;
  }
  const id = +document.getElementById('modal-id').textContent;
  //const data = globalData.find(d => d.id === id);
  let setMax = +document.getElementById('modal-set_max').value || 0;
    // Thu thập dữ liệu từ modal
  const settings = {
    id: id,
    name: document.getElementById('nameInput').value,
    state: +document.getElementById('modal-state').value,
    set_max: setMax,
    plan: +document.getElementById('modal-plan').value || 0,
    result: +document.getElementById('modal-result').value || 0,
    set: +document.getElementById('modal-set').value || 0,
    product: +document.getElementById('modal-product').value || 0,
    cycle: +document.getElementById('modal-cycle').value || 0,
    total: +document.getElementById('modal-total').value || 0
  };

  // Kiểm tra và giới hạn giá trị
  if (settings.plan < 0) settings.plan = 0;
  if (settings.result < 0) settings.result = 0;
  if (settings.set < 0) settings.set = 0;
  if (settings.product < 0) settings.product = 0;
  if (settings.cycle < 0) settings.cycle = 0;
  if (settings.total < 0) settings.total = 0;
  if (settings.plan > setMax) settings.plan = setMax;
  if (settings.result > setMax) settings.result = setMax;

  // Gửi tin nhắn WebSocket
  websocket.send(JSON.stringify(settings));
  console.log('Sent settings to server:', settings);

  // Đóng modal và cập nhật giao diện (dữ liệu sẽ cập nhật khi server phản hồi)
  bootstrap.Modal.getInstance(document.getElementById('settingModal')).hide();
  render();
}

function renderTable() {
  const rows = globalData.map(d =>
    `<tr>
      <td>${d.name}</td>
      <td>${d.id}</td>
      <td>${d.state[1]}</td>
      <td>${d.plan[1]}</td>
      <td>${d.result[1]}</td>
      <td>${d.cycle[1]}</td>
      <td>${d.total[1]}</td>
      <td>${d.set[1]}
      </td>
    </tr>`
  ).join('');
  return `<table class="table mt-4"><thead><tr><th>Name</th><th>ID</th><th>State</th><th>Plan</th><th>Result</th><th>Cycle</th><th>Total</th><th>Set</th></tr></thead><tbody>${rows}</tbody></table>`;
}


const loginModalElement = document.getElementById('loginModal');
const loginModal = new bootstrap.Modal(loginModalElement);

function toggleLoginModal() {
  loginModal.show();
}

loginModalElement.addEventListener('shown.bs.modal', () => {
  document.getElementById('login-password').focus();});

document.getElementById('login-password').addEventListener('keypress',function(event) {
  if (event.key === 'Enter') {
    submitLogin();
  }
});

function submitLogin() {
  const pw = document.getElementById('login-password').value;
  if (pw === passwords.staff) {
    currentUser = 'staff';    
  } else if (pw === passwords.admin) {
      currentUser = 'admin';
  } else {
    alert('Sai mật khẩu!');
    return;
  }
  document.getElementById(`loginAccount`).innerText = `${currentUser === 'admin' ? 'Admin' : 'Staff'}`;
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
function initChart() {
  const ctx = document.getElementById('myChart').getContext('2d');

  const labels = globalData.map(sensor => sensor.name); // tên cảm biến
  // const dataPlan = globalData.map(sensor => sensor.plan);
  // const dataResult = globalData.map(sensor => sensor.result);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Plan',
        data: globalData.map(sensor => sensor.plan),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.2
      },
      {
        label: 'Result',
        data: globalData.map(sensor => sensor.result),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.2
      }
    ]
  };

  const config = {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Plan vs Result Chart'
        }
      }
    },
  };
  window.myChart = new Chart(ctx, config); // lưu biểu đồ vào biến toàn cục để sau update
}


function updateChart() {
  if (window.myChart) {
    window.myChart.data.datasets[0].data = globalData.map(sensor => sensor.plan[1]);
    window.myChart.data.datasets[1].data = globalData.map(sensor => sensor.result[1]);
    window.myChart.update();
  }
}

