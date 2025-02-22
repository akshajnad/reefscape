/* ------------------------------------------------------
   script.js
   - Contains logic for counters, toggles, timer, field map,
     mandatory field validation, and QR code generation.
   - Data is output as short codes (key=value;) including Coral L4 fields.
------------------------------------------------------- */

/* ============= Timer Logic ============= */
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const fraction = Math.floor((ms % 1000) / 100);
  return String(minutes).padStart(2, '0') + ':' +
         String(seconds).padStart(2, '0') + '.' + fraction;
}
function updateTimerDisplay() {
  document.getElementById('timeToScoreCoralDisplay').textContent = formatTime(elapsedTime);
}
function startStopTimer() {
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    document.getElementById('startStopTimerBtn').textContent = 'Stop';
    timerInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      updateTimerDisplay();
    }, 100);
  } else {
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    document.getElementById('startStopTimerBtn').textContent = 'Start';
    document.getElementById('timeToScoreCoral').value = (elapsedTime / 1000).toFixed(2);
  }
}
function lapTimer() {
  document.getElementById('timeToScoreCoral').value = (elapsedTime / 1000).toFixed(2);
  alert('Lap recorded: ' + document.getElementById('timeToScoreCoral').value + 's');
}
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  elapsedTime = 0;
  document.getElementById('startStopTimerBtn').textContent = 'Start';
  updateTimerDisplay();
  document.getElementById('timeToScoreCoral').value = '0.00';
}

/* ============= Increment/Decrement ============= */
function increment(id) {
  const el = document.getElementById(id);
  let val = parseInt(el.value, 10);
  if (isNaN(val)) val = 0;
  el.value = val + 1;
}
function decrement(id) {
  const el = document.getElementById(id);
  let val = parseInt(el.value, 10);
  if (isNaN(val)) val = 0;
  if (val > 0) el.value = val - 1;
}

/* ============= Sliders ============= */
function updateOffenseSkillDisplay() {
  document.getElementById('offenseSkillValue').textContent = document.getElementById('offenseSkill').value;
}
function updateDefenseSkillDisplay() {
  document.getElementById('defenseSkillValue').textContent = document.getElementById('defenseSkill').value;
}

/* ============= Field Map Logic ============= */
const gridCols = 12;
const gridRows = 6;
function handleFieldClick(e) {
  const map = document.getElementById('fieldMap');
  const rect = map.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cellW = rect.width / gridCols;
  const cellH = rect.height / gridRows;
  const col = Math.floor(x / cellW);
  const row = Math.floor(y / cellH);
  const cellNum = row * gridCols + col + 1;
  document.getElementById('startingPosition').value = cellNum;
  const dot = document.getElementById('redDot');
  dot.style.left = (col * cellW + cellW/2 - 7) + 'px';
  dot.style.top = (row * cellH + cellH/2 - 7) + 'px';
  dot.style.display = 'block';
  checkMandatory();
}
function flipField() {
  document.getElementById('fieldMap').classList.toggle('flipped');
}
function undoPosition() {
  document.getElementById('redDot').style.display = 'none';
  document.getElementById('startingPosition').value = '';
  checkMandatory();
}

/* ============= Mandatory Fields Check ============= */
function validateMandatoryFields() {
  const scouter = document.getElementById('scouterInitials').value.trim();
  const robot = document.getElementById('robotNumber').value.trim();
  const startPos = document.getElementById('startingPosition').value.trim();
  const comments = document.getElementById('comments').value.trim();
  return scouter && robot && startPos && comments;
}
function checkMandatory() {
  document.getElementById('commitButton').disabled = !validateMandatoryFields();
}

/* ============= Build Short-Code Data String ============= */
function getFormDataString() {
  // Map each field to a short code.
  // Order must match the layout.
  const fieldsMap = [
    { code: 'si', id: 'scouterInitials' },
    { code: 'mn', id: 'matchNumber' },
    { code: 'rb', id: 'robotNumber' },
    { code: 'tn', id: 'teamNumber' },
    { code: 'sp', id: 'startingPosition' },
    { code: 'ns', id: 'noShow' },
    { code: 'cp', id: 'cagePosition' },
    
    { code: 'ma', id: 'movedAuto' },
    { code: 'tCor', id: 'timeToScoreCoral' },
    { code: 'c1a', id: 'coralL1Auto' },
    { code: 'c2a', id: 'coralL2Auto' },
    { code: 'c3a', id: 'coralL3Auto' },
    { code: 'c4a', id: 'coralL4Auto' },  // New field for Auto
    { code: 'baa', id: 'bargeAlgaeAuto' },
    { code: 'paa', id: 'processorAlgaeAuto' },
    { code: 'daa', id: 'dislodgedAlgaeAuto' },
    { code: 'af', id: 'autoFoul' },
    
    { code: 'dat', id: 'dislodgedAlgaeTele' },
    { code: 'pl', id: 'pickupLocation' },
    { code: 'c1t', id: 'coralL1Tele' },
    { code: 'c2t', id: 'coralL2Tele' },
    { code: 'c3t', id: 'coralL3Tele' },
    { code: 'c4t', id: 'coralL4Tele' },  // New field for Teleop
    { code: 'bat', id: 'bargeAlgaeTele' },
    { code: 'pat', id: 'processorAlgaeTele' },
    { code: 'tf', id: 'teleFouls' },
    { code: 'cf', id: 'crossedField' },
    { code: 'tfell', id: 'tippedFell' },
    { code: 'toc', id: 'touchedOpposingCage' },
    { code: 'dep', id: 'depTele' },
    
    { code: 'ep', id: 'endPosition' },
    { code: 'def', id: 'defended' },
    { code: 'trh', id: 'timeRemainingHang' },
    
    { code: 'ofs', id: 'offenseSkill' },
    { code: 'dfs', id: 'defenseSkill' },
    { code: 'yc', id: 'yellowCard' },
    { code: 'cs', id: 'cardStatus' },
    { code: 'cm', id: 'comments' }
  ];
  
  let result = '';
  fieldsMap.forEach(fm => {
    const el = document.getElementById(fm.id);
    let val = '';
    if (!el) {
      val = '';
    } else if (el.type === 'checkbox') {
      val = el.checked ? 'true' : 'false';
    } else {
      val = el.value;
    }
    result += `${fm.code}=${val};`;
  });
  return result;
}

/* ============= QR Modal ============= */
function showQRModal(dataString) {
  const modal = document.getElementById('qrModal');
  const qrDataP = document.getElementById('qrData');
  const qrCodeContainer = document.getElementById('qrCode');
  qrCodeContainer.innerHTML = '';
  new QRCode(qrCodeContainer, {
    text: dataString,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
  qrDataP.textContent = dataString;
  modal.style.display = 'block';
}
function closeQRModal() {
  document.getElementById('qrModal').style.display = 'none';
}

/* ============= Reset Form ============= */
function resetForm() {
  document.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.type === 'checkbox') {
      el.checked = false;
    } else if (el.type === 'number') {
      el.value = 0;
    } else if (el.tagName.toLowerCase() === 'select') {
      el.selectedIndex = 0;
    } else {
      el.value = '';
    }
  });
  document.getElementById('offenseSkill').value = 3;
  document.getElementById('defenseSkill').value = 3;
  updateOffenseSkillDisplay();
  updateDefenseSkillDisplay();
  resetTimer();
  document.getElementById('redDot').style.display = 'none';
  document.getElementById('startingPosition').value = '';
  document.getElementById('commitButton').disabled = true;
}

/* ============= On Load ============= */
window.onload = () => {
  // Timer
  document.getElementById('startStopTimerBtn').addEventListener('click', startStopTimer);
  document.getElementById('lapTimerBtn').addEventListener('click', lapTimer);
  document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);
  
  // Field map
  document.getElementById('fieldMap').addEventListener('click', handleFieldClick);
  document.getElementById('flipFieldBtn').addEventListener('click', flipField);
  document.getElementById('undoPositionBtn').addEventListener('click', undoPosition);
  
  // Commit button: build data string and show QR
  document.getElementById('commitButton').addEventListener('click', () => {
    if (!validateMandatoryFields()) {
      alert('Please fill out all required fields:\n- Scouter Initials\n- Robot\n- Auto Start Position\n- Comments');
      return;
    }
    const dataStr = getFormDataString();
    showQRModal(dataStr);
  });
  
  // Reset form
  document.getElementById('resetButton').addEventListener('click', resetForm);
  
  // Watch mandatory fields
  document.querySelectorAll('#scouterInitials, #robotNumber, #startingPosition, #comments')
    .forEach(el => el.addEventListener('input', checkMandatory));
  
  // Modal close
  document.getElementById('closeModal').addEventListener('click', closeQRModal);
  window.addEventListener('click', e => {
    if (e.target === document.getElementById('qrModal')) {
      closeQRModal();
    }
  });
  
  resetForm();
  updateTimerDisplay();
};
