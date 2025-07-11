let disks = [];
let currentRotation = 0;
let isSpinning = false;
let currentDiskIndex = null;

const wheelCanvas = document.getElementById("wheel");
const ctx = wheelCanvas.getContext("2d");

const overlay = document.getElementById("overlay");
const btnCreate = document.getElementById("btnCreate");
const disksDiv = document.getElementById("disks");
const editOverlay = document.getElementById("editOverlay");
const editTitle = document.getElementById("editTitle");
const optionInput = document.getElementById("optionInput");
const btnSave = document.getElementById("btnSave");
const btnCancel = document.getElementById("btnCancel");
const btnStart = document.getElementById("btnStart");

// 生成唯一ID（如需扩展功能可用）
function uuid() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// 打开创建轮盘弹窗
function showCreateDialog() {
  currentDiskIndex = null;
  showEditDialog("创建轮盘");
}

// 显示编辑弹窗
function showEditDialog(title) {
  editTitle.innerText = title;
  optionInput.value = "";
  editOverlay.style.display = "flex";
}

// 关闭编辑弹窗
function hideEditDialog() {
  editOverlay.style.display = "none";
}

// 保存到 localStorage
function saveToStorage() {
  localStorage.setItem("disks", JSON.stringify(disks));
}

// 从 localStorage 加载
function loadFromStorage() {
  const data = localStorage.getItem("disks");
  if (data) {
    const arr = JSON.parse(data);
    if (Array.isArray(arr)) {
      disks.splice(0, disks.length, ...arr);
    }
  }
}

// 渲染轮盘列表
function renderDisks() {
  disksDiv.innerHTML = "";
  disks.forEach((disk, index) => {
    const div = document.createElement("div");
    div.className = "disk";
    div.innerHTML = `
      <strong>${disk.name}</strong>
      <button class="btn-use">用轮盘</button>
      <button class="btn-edit">编辑</button>
      <button class="btn-delete">删除</button>
    `;
    disksDiv.appendChild(div);

    div.querySelector(".btn-use").onclick = () => useDisk(index);
    div.querySelector(".btn-edit").onclick = () => editDisk(index);
    div.querySelector(".btn-delete").onclick = () => deleteDisk(index);
  });
}

// 保存轮盘（新增或编辑）
function saveDisk() {
  const txt = optionInput.value.trim();
  if (!txt) {
    alert("请填写内容");
    return;
  }
  const options = txt
    .split("\n")
    .map((o) => o.trim())
    .filter((o) => o);
  if (options.length < 1) {
    alert("最少一个");
    return;
  }
  if (currentDiskIndex === null) {
    disks.push({ name: "轮盘" + (disks.length + 1), options: options });
  } else {
    disks[currentDiskIndex].options = options;
  }
  saveToStorage();
  renderDisks();
  hideEditDialog();
}

// 用轮盘抽奖
function useDisk(index) {
  overlay.style.display = "flex";
  currentDiskIndex = index;
  currentRotation = 0;
  drawWheel(disks[index].options, currentRotation);
}

// 编辑轮盘
function editDisk(index) {
  currentDiskIndex = index;
  showEditDialog("编辑轮盘");
  optionInput.value = disks[index].options.join("\n");
}

// 删除轮盘
function deleteDisk(index) {
  if (confirm("确认删除？")) {
    disks.splice(index, 1);
    saveToStorage();
    renderDisks();
  }
}

// 旋转动画
function spin() {
  if (isSpinning || currentDiskIndex === null) return;
  const options = disks[currentDiskIndex].options;
  if (!options || options.length === 0) {
    alert("当前轮盘没有选项！");
    return;
  }
  isSpinning = true;

  const total = options.length;
  const selectedIndex = Math.floor(Math.random() * total);
  const anglePer = (2 * Math.PI) / total;
  const targetAngle =
    (total - selectedIndex) * anglePer + Math.random() * anglePer;
  const totalTurns = 4 * Math.PI + targetAngle;
  const duration = 4000;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentRotation = progress * totalTurns;
    drawWheel(options, currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      alert("抽中的是：" + options[selectedIndex]);
      isSpinning = false;
    }
  }

  requestAnimationFrame(animate);
}

// 绘制转盘函数
function drawWheel(options, rotation = 0) {
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
  const n = options.length;
  const centerX = wheelCanvas.width / 2;
  const centerY = wheelCanvas.height / 2;
  const radius = 180;
  for (let i = 0; i < n; i++) {
    const angle = ((2 * Math.PI) / n) * i + rotation;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + (2 * Math.PI) / n);
    ctx.closePath();
    ctx.fillStyle = `hsl(${(i * 360) / n},70%,80%)`;
    ctx.fill();
    ctx.stroke();
    // 文字
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + Math.PI / n);
    ctx.textAlign = "center";
    ctx.fillStyle = "#333";
    ctx.font = "16px Arial";
    ctx.fillText(options[i], radius * 0.7, 8);
    ctx.restore();
  }
}

// 事件绑定
btnCreate.onclick = showCreateDialog;
btnSave.onclick = saveDisk;
btnCancel.onclick = hideEditDialog;
btnStart.onclick = spin;
overlay.onclick = function (e) {
  if (e.target === this) this.style.display = "none";
};

// 初始化
loadFromStorage();
renderDisks();
