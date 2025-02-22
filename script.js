/* ------------------------------------------------------
   script.js
   - Counters, sliders, timer, CSV, QR modal
   - Includes clickable field map for Starting Position
   - Checks mandatory fields on "Commit"
   - Now outputs short-code format: key=value;
------------------------------------------------------- */

/* ============= Timer Logic for Time to Score Coral ============= */
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const fraction = Math.floor((ms % 1000) / 100);
  return (
    String(minutes).padStart(2, '0') +
    ':' +
    String(seconds).padStart(2, '0') +
    '.' +
    fraction
  );
}

function updateTimerDisplay() {
  const display = document.getElementById('timeToScoreCoralDisplay');
  display.textContent = formatTime(elapsedTime);
}

function startStopTimer() {
  if (!isRunning) {
    // Start
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    document.getElementById('startStopTimerBtn').textContent = 'Stop';
    timerInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      updateTimerDisplay();
    }, 100);
  } else {
    // Stop
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

/* ============= Increment / Decrement ============= */
function increment(id) {
  const input = document.getElementById(id);
  let val = parseInt(input.value, 10);
  if (isNaN(val)) val = 0;
  input.value = val + 1;
}
function decrement(id) {
  const input = document.getElementById(id);
  let val = parseInt(input.value, 10);
  if (isNaN(val)) val = 0;
  if (val > 0) {
    input.value = val - 1;
  }
}

/* ============= Sliders ============= */
function updateOffenseSkillDisplay() {
  const val = document.getElementById('offenseSkill').value;
  document.getElementById('offenseSkillValue').textContent = val;
}
function updateDefenseSkillDisplay() {
  const val = document.getElementById('defenseSkill').value;
  document.getElementById('defenseSkillValue').textContent = val;
}

/* ============= Field Map (Starting Position) ============= */
const gridCols = 12;
const gridRows = 6;

function handleFieldClick(e) {
  const fieldMap = document.getElementById('fieldMap');
  const rect = fieldMap.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cellWidth = rect.width / gridCols;
  const cellHeight = rect.height / gridRows;
  const col = Math.floor(x / cellWidth);
  const row = Math.floor(y / cellHeight);
  const cellNumber = row * gridCols + col + 1;

  // Place the red dot
  const dot = document.getElementById('redDot');
  dot.style.left = (col * cellWidth + cellWidth / 2 - 7) + 'px';
  dot.style.top = (row * cellHeight + cellHeight / 2 - 7) + 'px';
  dot.style.display = 'block';

  document.getElementById('startingPosition').value = cellNumber;
}

function flipField() {
  const fieldMap = document.getElementById('fieldMap');
  fieldMap.classList.toggle('flipped');
}

function undoPosition() {
  document.getElementById('redDot').style.display = 'none';
  document.getElementById('startingPosition').value = '';
}

/* ============= Mandatory Fields Check ============= */
function validateMandatoryFields() {
  // Required fields: scouterInitials, robotNumber, startingPosition, comments
  const scouterInitials = document.getElementById('scouterInitials').value.trim();
  const robotNumber = document.getElementById('robotNumber').value.trim();
  const startingPosition = document.getElementById('startingPosition').value.trim();
  const comments = document.getElementById('comments').value.trim();

  if (!scouterInitials || !robotNumber || !startingPosition || !comments) {
    return false;
  }
  return true;
}

/* 
  ============= Build Short-Code String =============
  Instead of CSV, each field is code=value; 
  e.g. si=Bob;mn=3;rb=Red 1;...
*/
function getFormDataString() {
  // Short code map: { code: '...', id: '...' }
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
    { code: 'baa', id: 'bargeAlgaeAuto' },
    { code: 'paa', id: 'processorAlgaeAuto' },
    { code: 'daa', id: 'dislodgedAlgaeAuto' },
    { code: 'af', id: 'autoFoul' },

    { code: 'dat', id: 'dislodgedAlgaeTele' },
    { code: 'pl', id: 'pickupLocation' },
    { code: 'c1t', id: 'coralL1Tele' },
    { code: 'c2t', id: 'coralL2Tele' },
    { code: 'c3t', id: 'coralL3Tele' },
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
  for (const fm of fieldsMap) {
    const el = document.getElementById(fm.id);
    if (!el) {
      // Safety fallback
      result += `${fm.code}=;`;
      continue;
    }
    let val = '';
    if (el.type === 'checkbox') {
      val = el.checked ? 'true' : 'false';
    } else {
      val = el.value;
    }
    result += `${fm.code}=${val};`;
  }

  return result; // e.g. "si=Bob;mn=1;rb=Red 2;tn=111;..."
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
    } else if (el.tagName.toLowerCase() === 'textarea') {
      el.value = '';
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
}

/* ============= On Load ============= */
window.onload = () => {
  // Timer
  document.getElementById('startStopTimerBtn').addEventListener('click', startStopTimer);
  document.getElementById('lapTimerBtn').addEventListener('click', lapTimer);
  document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);

  // Commit
  document.getElementById('commitButton').addEventListener('click', () => {
    // Check mandatory fields first
    if (!validateMandatoryFields()) {
      alert('Please fill out all required fields:\n- Scouter Initials\n- Robot\n- Auto Start Position\n- Comments');
      return; // Stop if fields are missing
    }
    // Build short-code string
    const shortData = getFormDataString();
    // Show QR
    showQRModal(shortData);
  });

  // Reset
  document.getElementById('resetButton').addEventListener('click', resetForm);

  // Copy columns
  document.getElementById('copyColumnNamesButton').addEventListener('click', () => {
    // We could just copy the short codes or the "columns" from old CSV logic,
    // but let's do short codes for completeness:
    const shortCodes = [
      'si','mn','rb','tn','sp','ns','cp',
      'ma','tCor','c1a','c2a','c3a','baa','paa','daa','af',
      'dat','pl','c1t','c2t','c3t','bat','pat','tf','cf','tfell','toc','dep',
      'ep','def','trh','ofs','dfs','yc','cs','cm'
    ].join(',');
    navigator.clipboard.writeText(shortCodes)
      .then(() => alert('Short-code column names copied!'))
      .catch(err => console.error('Failed to copy', err));
  });

  // Modal close
  document.getElementById('closeModal').addEventListener('click', closeQRModal);
  window.addEventListener('click', e => {
    if (e.target === document.getElementById('qrModal')) {
      closeQRModal();
    }
  });

  // Field map
  document.getElementById('fieldMap').addEventListener('click', handleFieldClick);
  document.getElementById('flipFieldBtn').addEventListener('click', flipField);
  document.getElementById('undoPositionBtn').addEventListener('click', undoPosition);
};
