/* ------------------------------------------------------
   script.js
   This file integrates advanced functions from ScoutingPASS.js:
   • A free–form interactive field (not grid constrained)
   • Auto–fill of team number based on robot selection
   • Automatic increment of match number on form reset
   • New Coral L4 fields integrated into QR short-code data
------------------------------------------------------- */

/* ===== Timer Functions ===== */
let timerInterval = null;
let elapsedTime = 0;
let isRunning = false;
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const fraction = Math.floor((ms % 1000) / 100);
  return String(minutes).padStart(2, '0') + ':' +
         String(seconds).padStart(2, '0') + '.' +
         fraction;
}
function updateTimerDisplay() {
  document.getElementById('timeToScoreCoralDisplay').textContent = formatTime(elapsedTime);
}
function startStopTimer() {
  if (!isRunning) {
    isRunning = true;
    const startTime = Date.now() - elapsedTime;
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

/* ===== Increment/Decrement for Counters ===== */
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

/* ===== Slider Updates ===== */
function updateOffenseSkillDisplay() {
  document.getElementById('offenseSkillValue').textContent = document.getElementById('offenseSkill').value;
}
function updateDefenseSkillDisplay() {
  document.getElementById('defenseSkillValue').textContent = document.getElementById('defenseSkill').value;
}

/* ===== Interactive Field Functions ===== */
/* Improved onFieldClick: Allows free selection (not strictly grid‐constrained) */
function onFieldClick(event) {
  const map = document.getElementById('fieldMap');
  const rect = map.getBoundingClientRect();
  // Use event.offsetX/Y to get the click coordinates relative to the image
  const x = event.offsetX;
  const y = event.offsetY;
  // For free selection we still compute a “box” number based on a default resolution.
  const resX = 12, resY = 6; // default resolution; adjust as needed
  const cell = Math.ceil(x / (rect.width / resX)) +
               ((Math.ceil(y / (rect.height / resY)) - 1) * resX);
  document.getElementById('startingPosition').value = cell;
  // Position the red dot in the middle of the computed cell
  let center = findMiddleOfBox(cell, rect.width, rect.height, resX, resY);
  let coords = center.split(",");
  const dot = document.getElementById('redDot');
  dot.style.left = (parseFloat(coords[0]) - 7) + "px";
  dot.style.top = (parseFloat(coords[1]) - 7) + "px";
  dot.style.display = "block";
  checkMandatory();
}

/* Computes the center of a grid cell given its number and resolution */
function findMiddleOfBox(boxNum, width, height, resX, resY) {
  let boxWidth = width / resX;
  let boxHeight = height / resY;
  let col = (boxNum - 1) % resX;
  let row = Math.floor((boxNum - 1) / resX);
  let centerX = col * boxWidth + boxWidth / 2;
  let centerY = row * boxHeight + boxHeight / 2;
  return centerX + "," + centerY;
}

/* (Optional helper if needed) */
function getIdBase(name) {
  let idx = name.indexOf("_");
  return idx >= 0 ? name.substring(idx) : name;
}

/* ===== Auto-Fill Team Number ===== */
/* Dummy mapping – replace with your Blue Alliance API logic as needed */
function autoFillTeamNumber() {
  const robot = document.getElementById("robotNumber").value;
  if (!robot) return;
  const mapping = {
    "Red 1": "111",
    "Red 2": "222",
    "Red 3": "333",
    "Blue 1": "444",
    "Blue 2": "555",
    "Blue 3": "666"
  };
  document.getElementById("teamNumber").value = mapping[robot] || "";
}

/* ===== Mandatory Fields Check ===== */
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

/* ===== Build Short-Code Data String ===== */
function getFormDataString() {
  // Field mapping in order
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
    { code: 'c4a', id: 'coralL4Auto' },
    { code: 'baa', id: 'bargeAlgaeAuto' },
    { code: 'paa', id: 'processorAlgaeAuto' },
    { code: 'daa', id: 'dislodgedAlgaeAuto' },
    { code: 'af', id: 'autoFoul' },

    { code: 'dat', id: 'dislodgedAlgaeTele' },
    { code: 'pl', id: 'pickupLocation' },
    { code: 'c1t', id: 'coralL1Tele' },
    { code: 'c2t', id: 'coralL2Tele' },
    { code: 'c3t', id: 'coralL3Tele' },
    { code: 'c4t', id: 'coralL4Tele' },
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

/* ===== QR Modal Functions ===== */
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

/* ===== Reset Form (with auto–increment Match Number) ===== */
function resetForm() {
  // Auto–increment match number
  const matchInput = document.getElementById("matchNumber");
  let currentMatch = parseInt(matchInput.value, 10);
  if (!isNaN(currentMatch)) {
    matchInput.value = currentMatch + 1;
  }
  // Reset all other fields (except team number, which will be auto–filled when Robot changes)
  document.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.id === "matchNumber") return; // already incremented
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
  resetTimer();
  document.getElementById('redDot').style.display = 'none';
  document.getElementById('commitButton').disabled = true;
}

/* ===== Auto–Fill Team Number on Robot Change ===== */
function getRobot() {
  return document.getElementById("robotNumber").value;
}
function autoFillTeamNumber() {
  const robot = getRobot();
  if (!robot) return;
  const mapping = {
    "Red 1": "111",
    "Red 2": "222",
    "Red 3": "333",
    "Blue 1": "444",
    "Blue 2": "555",
    "Blue 3": "666"
  };
  document.getElementById("teamNumber").value = mapping[robot] || "";
}

/* ===== On Load ===== */
window.onload = () => {
  // Timer events
  document.getElementById('startStopTimerBtn').addEventListener('click', startStopTimer);
  document.getElementById('lapTimerBtn').addEventListener('click', lapTimer);
  document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);
  
  // Field map events – use our improved onFieldClick
  document.getElementById('fieldMap').addEventListener('click', onFieldClick);
  document.getElementById('flipFieldBtn').addEventListener('click', flipField);
  document.getElementById('undoPositionBtn').addEventListener('click', undoPosition);
  
  // When robot selection changes, auto–fill team number and check mandatory fields
  document.getElementById('robotNumber').addEventListener('change', () => {
    autoFillTeamNumber();
    checkMandatory();
  });
  
  // Mandatory fields watcher
  document.querySelectorAll('#scouterInitials, #robotNumber, #startingPosition, #comments')
    .forEach(el => el.addEventListener('input', checkMandatory));
  
  // Commit button: build short-code string and show QR if valid
  document.getElementById('commitButton').addEventListener('click', () => {
    if (!validateMandatoryFields()) {
      alert('Please fill out all required fields:\n- Scouter Initials\n- Robot\n- Auto Start Position\n- Comments');
      return;
    }
    const dataStr = getFormDataString();
    showQRModal(dataStr);
  });
  
  // Reset form button
  document.getElementById('resetButton').addEventListener('click', resetForm);
  
  // Modal close events
  document.getElementById('closeModal').addEventListener('click', closeQRModal);
  window.addEventListener('click', e => {
    if (e.target === document.getElementById('qrModal')) {
      closeQRModal();
    }
  });
  
  resetForm();
  updateTimerDisplay();
};
