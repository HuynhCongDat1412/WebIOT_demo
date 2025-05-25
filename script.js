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
  name: `Sensor ${i + 1}`,
  state: 'Stop',
  plan: 0,
  result: 0,
  set: 0,
  product: 0,
  cycle: 0,
  total: 0
}));

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
    card.innerHTML = `
      <h5>${data.name}</h5>
      <p>ID: ${data.id}</p>
      <p>State: ${data.state}</p>
      <p>Plan: ${data.plan} | Result: ${data.result}</p>
      ${currentUser !== 'user' ? `
      <div class="d-flex justify-content-between">
        <button class="btn btn-sm btn-secondary" onclick="openSetting(${data.id})">Setting</button>
        <button class="btn btn-sm btn-success" onclick="alert('Running ${data.id}')">Run</button>
        <button class="btn btn-sm btn-danger" onclick="alert('Reset ${data.id}')">Reset</button>
      </div>` : ''}
    `;
    tab1.appendChild(card);
  });

  if (currentUser === 'admin') {
  const detailSection = globalData.map(d =>
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
  ).join('');
  tab2.innerHTML = detailSection + renderTable();
  } 
}

function openSetting(id) {
  if (currentUser === 'user') return;
  const data = globalData.find(d => d.id === id);
  document.getElementById('modal-id').textContent = id;
  document.getElementById('nameInput').value = data.name;
  ['plan', 'result', 'set', 'product', 'cycle', 'total'].forEach(key => {
    document.getElementById(`modal-${key}`).value = data[key];
  });
  new bootstrap.Modal(document.getElementById('settingModal')).show();
}

function saveSettings() {
  const id = +document.getElementById('modal-id').textContent;
  const data = globalData.find(d => d.id === id);
  data.name = document.getElementById('nameInput').value;
  ['plan', 'result', 'set', 'product', 'cycle', 'total'].forEach(key => {
    let val = +document.getElementById(`modal-${key}`).value || 0;
    if (val < 0) val = 0;
    if (val > 999) val = 999;
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
