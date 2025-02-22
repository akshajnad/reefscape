/* ------------------------------------------------------
   Integrated script.js
   - Combines our prior code with full functionality from ScoutingPASS.js and TBAInterface.
   - Auto start position: free selection on field image.
   - Auto-fills team number from The Blue Alliance.
   - Resets form by incrementing match number automatically.
   - Builds output data as short-code key=value; string.
------------------------------------------------------ */

/* === TBA Interface Functions === */
var teams = null;
var schedule = null;
var authKey = "2XACou7MLBnRarV4LPD69OOTMzSccjEfedI2diYMvzuxbD6d2E9U9PEiPppOPjsE";

function getTeams(eventCode) {
  if (authKey) {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://www.thebluealliance.com/api/v3/event/" + eventCode + "/teams/simple";
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("X-TBA-Auth-Key", authKey);
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        teams = JSON.parse(this.responseText);
      }
    };
    xmlhttp.send();
  }
}

function getSchedule(eventCode) {
  if (authKey) {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://www.thebluealliance.com/api/v3/event/" + eventCode + "/matches/simple";
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("X-TBA-Auth-Key", authKey);
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        schedule = JSON.parse(this.responseText);
      }
    };
    xmlhttp.send();
  }
}

/* === Timer Functions === */
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

/* === Increment/Decrement for Counters === */
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

/* === Slider Updates === */
function updateOffenseSkillDisplay() {
  document.getElementById('offenseSkillValue').textContent = document.getElementById('offenseSkill').value;
}
function updateDefenseSkillDisplay() {
  document.getElementById('defenseSkillValue').textContent = document.getElementById('defenseSkill').value;
}

/* === Interactive Field (Auto Start Position) === */
/* Free selection: user can click anywhere on the field image */
function onFieldClick(event) {
  const map = document.getElementById('fieldMap');
  const rect = map.getBoundingClientRect();
  const x = event.offsetX;
  const y = event.offsetY;
  // Use default resolution of 12 columns × 6 rows to compute a cell number.
  const resX = 12, resY = 6;
  const cell = Math.ceil(x / (rect.width / resX)) +
               ((Math.ceil(y / (rect.height / resY)) - 1) * resX);
  document.getElementById('startingPosition').value = cell;
  let center = findMiddleOfBox(cell, rect.width, rect.height, resX, resY);
  let coords = center.split(",");
  const dot = document.getElementById('redDot');
  dot.style.left = (parseFloat(coords[0]) - 7) + "px";
  dot.style.top = (parseFloat(coords[1]) - 7) + "px";
  dot.style.display = "block";
  checkMandatory();
}
function findMiddleOfBox(boxNum, width, height, resX, resY) {
  let boxWidth = width / resX;
  let boxHeight = height / resY;
  let col = (boxNum - 1) % resX;
  let row = Math.floor((boxNum - 1) / resX);
  let centerX = col * boxWidth + boxWidth / 2;
  let centerY = row * boxHeight + boxHeight / 2;
  return centerX + "," + centerY;
}
function undoPosition() {
  document.getElementById('redDot').style.display = 'none';
  document.getElementById('startingPosition').value = '';
  checkMandatory();
}

/* === Auto-Fill Team Number from Blue Alliance === */
/* Convert robot value ("Red 1" or "Blue 2") into "r1"/"b2" format */
function getRobot() {
  let r = document.getElementById("robotNumber").value;
  if (!r) return "";
  r = r.toLowerCase().replace("red ", "r").replace("blue ", "b");
  return r;
}
function getCurrentMatchKey() {
  // Use event code from hidden input "eventCode" and match number from "matchNumber"
  const eventCode = document.getElementById("eventCode").value;
  const match = document.getElementById("matchNumber").value;
  return eventCode + "_" + match;
}
function getMatch(matchKey) {
  if (schedule) {
    let ret = null;
    schedule.forEach(match => {
      if (match.key === matchKey) {
        ret = match;
      }
    });
    return ret;
  }
  return null;
}
function getCurrentMatch() {
  return getMatch(getCurrentMatchKey());
}
function getCurrentTeamNumberFromRobot() {
  const robot = getRobot();
  const match = getCurrentMatch();
  if (robot && match) {
    if (robot.charAt(0) === "r") {
      let index = parseInt(robot.charAt(1)) - 1;
      return match.alliances.red.team_keys[index];
    } else if (robot.charAt(0) === "b") {
      let index = parseInt(robot.charAt(1)) - 1;
      return match.alliances.blue.team_keys[index];
    }
  }
  return "";
}
function autoFillTeamNumber() {
  const team = getCurrentTeamNumberFromRobot();
  if (team) {
    document.getElementById("teamNumber").value = team.replace("frc", "");
  }
}

/* === Mandatory Fields Check === */
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

/* === Build Short-Code Data String === */
function getFormDataString() {
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

/* === QR Modal Functions === */
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

/* === Reset Form (Auto-Increment Match Number) === */
function resetForm() {
  const matchInput = document.getElementById("matchNumber");
  let currentMatch = parseInt(matchInput.value, 10);
  if (!isNaN(currentMatch)) {
    matchInput.value = currentMatch + 1;
  }
  document.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.id === "matchNumber" || el.id === "eventCode") return;
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

/* === Copy Column Names (Short Codes) === */
function copyColumnNames() {
  const columns = [
    'si','mn','rb','tn','sp','ns','cp',
    'ma','tCor','c1a','c2a','c3a','c4a','baa','paa','daa','af',
    'dat','pl','c1t','c2t','c3t','c4t','bat','pat','tf','cf','tfell','toc','dep',
    'ep','def','trh','ofs','dfs','yc','cs','cm'
  ].join(",");
  navigator.clipboard.writeText(columns)
    .then(() => alert('Short-code column names copied!'))
    .catch(err => console.error('Failed to copy column names', err));
}

/* === Window Onload: Initialize Everything === */
window.onload = () => {
  // Get event code from hidden input and fetch teams/schedule from TBA
  const eventCode = document.getElementById("eventCode").value;
  getTeams(eventCode);
  getSchedule(eventCode);
  
  // Timer events
  document.getElementById('startStopTimerBtn').addEventListener('click', startStopTimer);
  document.getElementById('lapTimerBtn').addEventListener('click', lapTimer);
  document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);
  
  // Field map events
  document.getElementById('fieldMap').addEventListener('click', onFieldClick);
  document.getElementById('flipFieldBtn').addEventListener('click', () => {
    document.getElementById('fieldMap').classList.toggle('flipped');
  });
  document.getElementById('undoPositionBtn').addEventListener('click', undoPosition);
  
  // When robot selection changes, auto-fill team number using TBA data
  document.getElementById('robotNumber').addEventListener('change', () => {
    autoFillTeamNumber();
    checkMandatory();
  });
  
  // Watch mandatory fields
  document.querySelectorAll('#scouterInitials, #robotNumber, #startingPosition, #comments')
    .forEach(el => el.addEventListener('input', checkMandatory));
  
  // Commit button: validate mandatory fields, build data string, and show QR code
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
  
  // Copy column names button
  document.getElementById('copyColumnNamesButton').addEventListener('click', copyColumnNames);
  
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
