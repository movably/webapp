var r = g = b = 255; // White by default.

// Run chrome://bluetooth-internals to see if available

let url_string = window.location.href
var url = new URL(url_string);
let engineering_enabled = false
if(url.searchParams.get("engineering")=="true"){
  engineering_enabled = true;
}


if(url.searchParams.get("analytics")=="true"){
  document.querySelector('#state').classList.add('analytics');
}
let chairSerial = null
let set_device_info = url.searchParams.get("set_info")

let autoSlider = new Slider("slider1","slider1Title","slider1Value");
autoSlider.setProperties("Auto Period (min):","1","10", "min")
autoSlider.registerChanges(FlamingoBle.setAutoPeriod, 
    FlamingoBle.getAutoPeriod,
    FlamingoBle);




let leftMotorSoundSlider = new Slider("leftSoundSlider","leftSoundSliderTitle","leftSoundSliderValue");
leftMotorSoundSlider.setProperties("Motor sound:","0","50", "%")
leftMotorSoundSlider.registerChanges(FlamingoBle.setBothMotorSoundStrength, 
    FlamingoBle.getLeftMotorSoundStrength,
    FlamingoBle);





let velSlider, accelSlider, deccelSlider, trajVelSlider;

// if(engineering_enabled){
//   velSlider = new Slider("slider2","slider2Title","slider2Value");
//   velSlider.setProperties("Vel Limit:","1","25","")
//   velSlider.registerChanges(FlamingoBle.setVelLimit, 
//       FlamingoBle.getVelLimit,
//       FlamingoBle);

//   accelSlider = new Slider("slider3","slider3Title","slider3Value");
//   accelSlider.setProperties("Accel Limit:","1","25","")
//   accelSlider.registerChanges(FlamingoBle.setAccelLimit, 
//       FlamingoBle.getAccelLimit,
//       FlamingoBle);

//   deccelSlider = new Slider("slider4","slider4Title","slider4Value");
//   deccelSlider.setProperties("Deccel Limit:","1","25","")
//   deccelSlider.registerChanges(FlamingoBle.setDeccelLimit, 
//       FlamingoBle.getDeccelLimit,
//       FlamingoBle);

//   trajVelSlider = new Slider("slider5","slider5Title","slider5Value");
//   trajVelSlider.setProperties("Traj Vel Limit:","1","25","")
//   trajVelSlider.registerChanges(FlamingoBle.setTrajVelLimit, 
//       FlamingoBle.getTrajVelLimit,
//       FlamingoBle);
// }


console.log("engineering enabled =", engineering_enabled)

function onDisconnect(event){
  console.log("Disconnected");
  // document.querySelector('#state').classList.remove('connecting');
  // document.querySelector('#state').classList.remove('connected');

  document.querySelector('#state').classList.remove('engineering');
  document.querySelector('#state').classList.remove('connected');
  document.querySelector('#state').classList.add('connecting');
  FlamingoBle.connect(engineering_enabled)
  .then(_ => {
    document.querySelector('#state').classList.remove('connecting');
    document.querySelector('#state').classList.add('connected');

    document.querySelector('#blow').textContent = '';
    FlamingoBle.getAutoMode();
    FlamingoBle.getAutoPeriod().then(autoSlider.handleRead);
    FlamingoBle.setCurrentTime();
    FlamingoBle.enableChairEvents();
    // FlamingoBle.getChairEvent().then((response) => handleChairEventRead(response));
    FlamingoBle.startListenChairEvents(handleChairEvents);
    FlamingoBle.startListenChairStateRead(handleChairEventRead);
    FlamingoBle.startListenAutoPeriod(handlePeriodChange)
    FlamingoBle.getChairEvent()
    FlamingoBle.getSwVersion().then(
      FlamingoBle.getFwVersion().then(
        _ => document.querySelector('#currentVersionTitle').textContent = "Current version: " + FlamingoBle.data.getVersion()
      )
    )


    if(engineering_enabled){
      document.querySelector('#state').classList.add('engineering');
      //FlamingoBle.startRealtimeEvents(handleRealtimeEvents);

      // FlamingoBle.getVelLimit().then(velSlider.handleRead);
      // FlamingoBle.getAccelLimit().then(accelSlider.handleRead);
      // FlamingoBle.getDeccelLimit().then(deccelSlider.handleRead);
      // FlamingoBle.getTrajVelLimit().then(trajVelSlider.handleRead);

      FlamingoBle.startErrorCodeEvents(handleErrorCodes);
      FlamingoBle.getErrorCodes();

      FlamingoBle.getSerialNumber().then(handleDeviceSerial);
      FlamingoBle.getEmailString().then(handleDeviceEmail);
      FlamingoBle.getWiFiPWDString().then(handleWiFiPWD);
    }
  })
  .catch(error => {
    document.querySelector('#state').classList.remove('connecting');
    // TODO: Replace with toast when snackbar lands.
    console.error('Argh!', error);
    console.log(error.messsage);

  });
}


document.querySelector('#connect').addEventListener('click', function() {

  
  FlamingoBle.request(onDisconnect)
  .then(_ => connectDevice())
  .catch(error => {
    document.querySelector('#state').classList.remove('connecting');
    // TODO: Replace with toast when snackbar lands.
    console.error('Argh!', error);
    console.log(error.messsage);

  });
});

function connectDevice(){
    FlamingoBle.request(onDisconnect)

    document.querySelector('#state').classList.remove('engineering');
    document.querySelector('#state').classList.remove('connected');
    document.querySelector('#state').classList.add('connecting');

    return FlamingoBle.connect(engineering_enabled)
    .then(_ => {
    document.querySelector('#state').classList.remove('connecting');
    document.querySelector('#state').classList.add('connected');
    document.querySelector('#blow').textContent = '';
    FlamingoBle.getAutoMode();
    FlamingoBle.getAutoPeriod().then(autoSlider.handleRead);
    FlamingoBle.setCurrentTime();
    FlamingoBle.enableChairEvents();
    FlamingoBle.startListenChairEvents(handleChairEvents);
    FlamingoBle.startListenChairStateRead(handleChairEventRead);
    FlamingoBle.startListenAutoPeriod(handlePeriodChange)
    FlamingoBle.getChairEvent()
    FlamingoBle.getSwVersion().then(
      FlamingoBle.getFwVersion().then(
        _ => document.querySelector('#currentVersionTitle').textContent = "Current version: " + FlamingoBle.data.getVersion()
      )
    )
    FlamingoBle.getLeftMotorSoundStrength().then(leftMotorSoundSlider.handleRead);
    
    FlamingoBle.getAutoModeSelector().then(handleAutoModeSelectorRead)

    if(engineering_enabled){
      document.querySelector('#state').classList.add('engineering');
      //FlamingoBle.startRealtimeEvents(handleRealtimeEvents);

      // Add the SPI Communication Settings card
      const spiCardContainer = document.getElementById('spi-communication-card-container');
      spiCardContainer.innerHTML = `
        <div class="card">
          <div class="card-info">
              <small>SPI Communication Settings</small>
          </div>

          <hr>

          <div class="preference" style="text-align: left; padding: 10px;">
            <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" 
              for="reduced-spi-switch">
              Reduced SPI communication
            <input type="checkbox" id="reduced-spi-switch" 
                   class="mdl-switch__input">
            </label>
            <div class="mdl-tooltip" for="reduced-spi-switch">Enable to reduce SPI communication frequency</div>
          </div>
        </div>
      `;

      // Initialize the Material Design Lite switch component
      componentHandler.upgradeElement(document.getElementById('reduced-spi-switch').parentElement);

      // Get the Reduced SPI communication setting
      FlamingoBle.getReducedSPICommunication().then(handleReducedSPIRead);

      // Add event listener for the checkbox
      document.querySelector('#reduced-spi-switch').addEventListener('change', function() {
        console.log("Reduced SPI communication changed to:", this.checked);
        FlamingoBle.setReducedSPICommunication(this.checked ? 1 : 0);
      });

      FlamingoBle.startErrorCodeEvents(handleErrorCodes);
      FlamingoBle.getErrorCodes();

      FlamingoBle.startWiFiStatusCodeEvents(handleWiFiCodes);
      FlamingoBle.getWiFiStatusCodes();
      //FlamingoBle.getWiFiPWDString().then(handleWiFiPWD);

      FlamingoBle.getSerialNumber().then(handleDeviceSerial);
      FlamingoBle.getEmailString().then(handleDeviceEmail);
      readWiFiSSIDsMultipleTimes();
      addMOSDateToDropdown("Day")
      addMOSDateToDropdown("Week")
      addMOSDateToDropdown("Month")
      addMOSDateToDropdown("Year")
    }
  })
  .catch(error => {
    document.querySelector('#state').classList.remove('connecting');
    // TODO: Replace with toast when snackbar lands.
    console.error('Argh!', error);
    console.log(error.messsage);

  });
}


pushNotificationMsg("Notifications Enabled.")

function pushNotificationMsg(msg) {
  // try{
  //   playSound("mixkit-positive-notification-951.wav")
  // } catch (e) {
  //   console.log(e)
  // }

  try {
    console.log("Notification! " + msg)
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      var notification = new Notification("Flamingo Notification!", {
        body: msg,
        icon: "movably_icon.png"
      });
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          var notification = new Notification("Hi there!");
        }
      });
    }
  } catch (e) {
      if (e.name == 'TypeError')
          return false;
  }
}

let chairMode = "manual";
let rightSide = "";
let leftSide = "";
modes = ["manual","auto","away"];

function handleChairEventRead(event){
  v = event.target.value;
  console.log("-> chair state =", v.getUint8(0), v.getUint8(1), v.getUint8(2))

  leftSide = v.getUint8(0) == 0 ? "up":"down"

  rightSide = v.getUint8(1) == 0 ? "up":"down"


  document.querySelector('#left').textContent = "Left: " +leftSide;
  document.querySelector('#right').textContent = "Right: " +rightSide;

  mode = v.getUint8(2);

  if(mode < modes.length){
    chairMode = modes[mode];
  }

  let s = document.getElementById("auto-switch")


  if(v.getUint8(2) == 1){
    s.parentElement.MaterialSwitch.on();
  } else {
    s.parentElement.MaterialSwitch.off();
  }
}


function handleChairEvents(event){
  v = event.target.value;
  console.log("-> chair state =", v.getUint8(0), v.getUint8(1), v.getUint8(2))

  rightSide = v.getUint8(0) == 0 ? "up":"down"

  leftSide = v.getUint8(1) == 0 ? "up":"down"

  mode = v.getUint8(2);

  var unused = v.getUint8(3);



  let event_time = new Date(v.getUint8(4) | (v.getUint8(5)<<8), v.getUint8(6) - 1, v.getUint8(7), v.getUint8(8), v.getUint8(9), v.getUint8(10), v.getUint8(12) | (v.getUint8(13)<<8))

  // console.log(v);

  // console.log("event time = ", event_time)

  if(mode < modes.length){
    chairMode = modes[mode];
  }

  // handleChairEventRead(event.target.value);
  console.log("-> chair event =", v.getUint8(0), v.getUint8(1), v.getUint8(2))
}

let chair_period = 0;
function handlePeriodChange(event){
  v = event.target.value;
  chair_period = new Uint32Array(v.buffer)[0];
  console.log("-> period changed: ", chair_period, "sec = ", chair_period/60.0, "min");
}


function handleWiFiCodes(event) {
  console.log("-> WiFi status event");

  // Assuming event.target.value is a Uint8Array containing the WiFi status code
  let wifi_code = event.target.value.getUint8(0);
  // Log the raw value to the console
  console.log("handleWiFiCodes() -> Raw Value:", wifi_code);

  // Mapping C enum values to corresponding strings in JavaScript
  const wifiStatusStrings = [
    "Disabled",
    "NotConfigured",
    "ErrorConnecting",
    "Connecting",
    "Connected",
    "Disconnected",
    "WifiNotFound",
    "SSID_PW_Invalid",
    "InternalError",
    "Disconnecting",
  ];

  let wifi_string = "WiFi Status: ";

  // Check if wifi_code is within the valid range
  if (wifi_code >= 0 && wifi_code < wifiStatusStrings.length) {
    wifi_string += wifiStatusStrings[wifi_code];
  } else {
    wifi_string += "Unknown";
  }

  document.querySelector('#wifistatusString').textContent = wifi_string;
}

function handleErrorCodes(event){
  console.log("-> error event");
  let error_code = event.target.value.getUint16(0);
  error_code = error_code >> 8;

  let left_motor_comm_error = error_code & 0x1;
  let right_motor_comm_error = (error_code >> 1) & 0x1;
  let left_button_comm_error = (error_code >> 2) & 0x1;
  let right_button_comm_error = (error_code >> 3) & 0x1;
  let base_comm_error = (error_code >> 4) & 0x1;


  let error_string = "Active Errors: "


  if(error_code == 0){
    error_string += "None"
  }

  if(left_motor_comm_error){
    error_string += "Left Motor Communication, "
  }

  if(right_motor_comm_error){
    error_string += "Right Motor Communication, "
  }

  if(left_button_comm_error){
    error_string += "Left Button Communication, "
  }

  if(right_button_comm_error){
    error_string += "Right Botton Communication, "
  }

  if(base_comm_error){
    error_string += "Base Sensor Communication, "
  }

  document.querySelector('#statusString').textContent = error_string;

}

function handleAutoModeSelectorRead(modeId){
  console.log("AutoSelctor = " + modeId);

  document.querySelector('#AutoMode' + modeId).checked = true;
}


document.querySelector('#AutoMode0').addEventListener('click', selectAutoMode);
document.querySelector('#AutoMode1').addEventListener('click', selectAutoMode);
document.querySelector('#AutoMode2').addEventListener('click', selectAutoMode);
document.querySelector('#AutoMode5').addEventListener('click', selectAutoMode);

// Handle Reduced SPI communication checkbox
function handleReducedSPIRead(enabled) {
  console.log("Reduced SPI communication:", enabled);
  let s = document.getElementById("reduced-spi-switch");
  if (enabled) {
    s.parentElement.MaterialSwitch.on();
  } else {
    s.parentElement.MaterialSwitch.off();
  }
}

// document.querySelector('#manualMode').addEventListener('click', changeMode);
// document.querySelector('#autoMode').addEventListener('click', changeMode);

document.querySelector('#setDeviceInfo').addEventListener('click', setDeviceInfo);
document.querySelector('#setWiFiSettings').addEventListener('click', setDeviceWiFiSettings);

document.getElementById("auto-switch").addEventListener('click', changeModeToggle);


function handleDeviceSerial(info){

  document.querySelector('#title2').textContent = "Connected to Flamingo Chair " + info;
  // document.querySelector('#titleDeviceSerial').textContent = "Serial #: " + info;
  chairSerial = info;
}

function handleDeviceEmail(info){
  document.querySelector('#inputEmail').value = info;
}


function handleWiFiPWD(info){
  document.querySelector('#inputWiFiPWD').value = info;
}

function connectDeviceWiFiCommand(){
  FlamingoBle.issueWiFiCommand(1);
}

function disconnectDeviceWiFiCommand(){
  FlamingoBle.issueWiFiCommand(2);
}


function setDeviceWiFiSettings(){
  // Get the dropdown element
  let dropdown = document.getElementById("inputWiFiSSID");
  ssid = dropdown.options[dropdown.selectedIndex].value;
  pwd = document.querySelector('#inputWiFiPWD').value;

  FlamingoBle.setWiFiSSIDString(ssid)
  .then(FlamingoBle.setWiFiPWDString(pwd))
  .then(FlamingoBle.setWiFiEnable(true));

  FlamingoBle.setTZInfoDeviceString(Intl.DateTimeFormat().resolvedOptions().timeZone);

  setTimeout(function(){ 
      handleWiFiPWD("");
    }, 1000);

}


function setDeviceInfo(){
  email = document.querySelector('#inputEmail').value;

  FlamingoBle.setEmailString(email);
  FlamingoBle.setTZInfoDeviceString(Intl.DateTimeFormat().resolvedOptions().timeZone);


  setTimeout(function(){ 
      FlamingoBle.getEmailString().then(handleDeviceEmail);
    }, 1000);

}


function handleChairConfiguredChBox(value){
  console.log("-> ChairConfigured =")
  console.log(value)
  document.querySelector('#triggerWiFiConfiguredEnable').checked = value;
}

function ChairConfiguredEnable(){
  FlamingoBle.setChairConfiguredFlag(document.querySelector('#triggerWiFiConfiguredEnable').checked)
    .then(_ => FlamingoBle.getChairConfiguredFlag())
    .then((value) => handleChairConfiguredChBox(value));
}


function changeMode() {
  var effect = document.querySelector('[name="effectSwitch"]:checked').id;
  switch(effect) {
    case 'manualMode':
      FlamingoBle.setMode(0);
      break;
    case 'autoMode':
      FlamingoBle.setMode(1);;
      break;
  }
}

function selectAutoMode() {
  var modeType = document.querySelector('[name="effectSwitch"]:checked').value;
  console.log("selecting mode type: " + modeType)
  FlamingoBle.setAutoModeSelector(modeType);
  // switch(effect) {
  //   case 'manualMode':
  //     FlamingoBle.setMode(0);
  //     break;
  //   case 'autoMode':
  //     FlamingoBle.setMode(1);;
  //     break;
  // }
}

function changeModeToggle() {
  var effect = document.getElementById("auto-switch").checked;
  FlamingoBle.setMode(effect);
}

window.addEventListener('unhandledrejection', function() {
  colorChanging = false;
});

window.onload = function() {
  var connect = document.getElementById("connect");
  var no_bt = document.getElementById("no-bluetooth");
  if (navigator.bluetooth == undefined) {
    console.log("No navigator.bluetooth found.");
    connect.style.display = "none";
    no_bt.style.display = "block";
  } else {
    connect.style.display = "block";
    no_bt.style.display = "none";
  }
  screen.orientation.lock('portrait').catch(e => e);
};


function moveLeft(){
  // console.log("moveLeft")
  FlamingoBle.setToggle(0);
}


function moveRight(){
  // console.log("moveRight")
  FlamingoBle.setToggle(1);
}
document.querySelector('#left').addEventListener('click', moveLeft);
document.querySelector('#right').addEventListener('click', moveRight);




document.getElementById('MOS_request_btn').addEventListener('click', function() {
  let dropdown = document.getElementById("inputMOSDate");
    let selectedInterval = dropdown.value.toLowerCase(); // Get the currently selected value from the dropdown and ensure it's lowercase

    let fromDate = null, toDate = null;
    const today = new Date();

    if (selectedInterval === "day") {
        fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1); // Set to the day before today
        toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Set to the day after today
    } else if (selectedInterval === "month") {
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1); // Set to the first day of the current month
        toDate = new Date(today.getFullYear(), today.getMonth() + 1, 1); // Set to the first day of the next month
    } else if (selectedInterval === "week") {
        let day = today.getDay(); // Get current day of the week (0 for Sunday, 1 for Monday, etc.)
        fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day); // Set to the first day of this week (Sunday)
        toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day + 7); // Set to the first day of the next week (next Sunday)
    } else if (selectedInterval === "year") { // New block for handling "year" interval
      fromDate = new Date(today.getFullYear(), 0, 1); // Set to the first day of the current year (January 1st)
      toDate = new Date(today.getFullYear() + 1, 0, 1); // Set to the first day of the next year (January 1st)
  }

    // Ensure that fromDate and toDate are defined before proceeding
    if (fromDate && toDate) {
        // Format dates to YYYY-MM-DD
        let formattedFromDate = fromDate.toISOString().split('T')[0];
        let formattedToDate = toDate.toISOString().split('T')[0];
        let useremail = document.getElementById('inputEmail').value;

  const query = `
  {
    chairUsageByLegPosition {
        key {email(like: "${useremail}")}
        leftLegPos {name}
        rightLegPos {name}
        count
        stateDuration
        eventTimeFrom(from: "${formattedFromDate}") @skip(if: ${selectedInterval !== 'day' && selectedInterval !== 'month' && selectedInterval !== 'week'})
        eventTimeTo(from: "${formattedToDate}") @skip(if: ${selectedInterval !== 'day' && selectedInterval !== 'month' && selectedInterval !== 'week'})
    }
  }
  `;

  const url = "https://movably.fielden.com.au/api/graphql";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'API-KEY': 'f3162d2f-e798-4b5e-ae59-9540d69dc56c',
        'Time-Zone': timezone
      },
      body: JSON.stringify({ query: query })
  };

  fetch(url, options)
      .then(response => response.json())
      .then(data => {
        const counts = { "Stand": 0, "Sit": 0, "Flamingo": 0 }; // Initialize counts for each label
        let totalMovements = 0; // Initialize total movements count

        // Process data and accumulate counts
        data.data.chairUsageByLegPosition.forEach(entry => {
            let label;
            if (entry.leftLegPos.name === "Up" && entry.rightLegPos.name === "Up") {
                label = "Stand";
            } else if (entry.leftLegPos.name === "Down" && entry.rightLegPos.name === "Down") {
                label = "Sit";
            } else {
                label = "Flamingo";
            }

            counts[label] += entry.count;
            totalMovements += entry.count;
        });

        // Build the output string with percentage representation
        //let formattedData = Object.keys(counts).map(label => {
        //return `Position: ${label}, Movements: ${counts[label]}`;
        //}).join('<br>');

        // Build the output string for total movements
        let formattedData = `Posture changes: ${totalMovements}`;
        // Display the formatted data
        document.getElementById('MOS_out_String').innerHTML = formattedData;
    })
      .catch(error => {
          console.error('Error fetching data: ', error);
          document.getElementById('MOS_out_String').innerText = 'Failed to fetch data.';
      });
    } else {
      console.error('Date values are not set. No request made.');
  }
});


function getData() {
  return Math.random();
};

function createNewPlotter() {
  let layout = {
    xaxis: {
      title: {
        text: 'Time (seconds since device power on)',
        font: {
          family: 'Old Standard TT, serif',
          size: 18,
          color: '#ffffff'
        }
      },
      // automargin: true,
      // showgrid: true,
      // zeroline: true,
      // showline: true,
      // mirror: 'ticks',
      gridcolor: '#bdbdbd',
      // gridwidth: 2,
      // zerolinecolor: '#969696',
      // zerolinewidth: 4,
      linecolor: '#636363',
      // linewidth: 6,
      tickfont: {
      //   family: 'Old Standard TT, serif',
      //   size: 14,
        color: 'white'
      },
    },
    yaxis: {
      automargin: true,
      showgrid: true,
      zeroline: true,
      showline: true,
      mirror: 'ticks',
      gridcolor: '#bdbdbd',
      gridwidth: 2,
      zerolinecolor: '#969696',
      zerolinewidth: 4,
      linecolor: '#636363',
      linewidth: 6,
      tickfont: {
        family: 'Old Standard TT, serif',
        size: 14,
        color: 'white'
      },
    },
    margin: {
      l: 40,
      r: 0,
      b: 100,
      t: 50,
      pad: 4
    },
    showlegend: true,
    legend: {
      // "orientation": "h",
      font:{"color":'#FFFFFF'},
      // x: 0.03, 
      // y: 1.15

    },
    paper_bgcolor: "rgba(0, 0, 0, 0)",
    // width: 1000,
    autosize: true,
  }


  Plotly.newPlot('chart', [{
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'left_angle (degrees)',
    mode: 'lines',
    line: { color: '#80CAF6' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'right_angle (degrees)',
    mode: 'lines',
    line: { color: '#DF56F1' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'base_strain',
    mode: 'lines',
    visible: 'legendonly',
    line: { color: '#4D92E9' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'left_state',
    mode: 'lines',
    visible: 'legendonly'
    // line: { color: '#4D92E9' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'right_state',
    mode: 'lines',
    visible: 'legendonly'
    // line: { color: '#4D92E9' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'left_folded',
    mode: 'lines',
    visible: 'legendonly'
    // line: { color: '#4D92E9' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'left_seated',
    mode: 'lines',
    visible: 'legendonly'
    // line: { color: '#4D92E9' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'left_unlocked',
    mode: 'lines',
    visible: 'legendonly'
    // line: { color: '#4D92E9' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'right_folded',
    mode: 'lines',
    visible: 'legendonly'
    // line: { color: '#4D92E9' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'right_seated',
    mode: 'lines',
    visible: 'legendonly'
    // line: { color: '#4D92E9' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'right_unlocked',
    mode: 'lines',
    visible: 'legendonly'
    // line: { color: '#4D92E9' }
  }, {
    y:[],
    x:[],
    // y: [0].map(getData),
    name: 'base_std',
    mode: 'lines',
    visible: 'legendonly'
    // line: { color: '#4D92E9' }
  }
  ],layout);

}


var cnt = 0;

xbuffer = [[], 
    [], 
    [], 
    [], 
    [], 
    [], 
    [], 
    [], 
    [], 
    [],
    [],
    []];

ybuffer = [[], 
    [], 
    [], 
    [], 
    [], 
    [], 
    [], 
    [], 
    [], 
    [],
    [],
    []];

__lock = false;

data_count = 0;

let state_right_pre = 0;
let state_left_pre = 0;

const kHoming = 0; ///< Used for the HomingState
const kSeated = 1; ///< Used for the SeatedState
const kSeating = 2; ///< Used for the SeatingState
const kFolded = 3; ///< Used for the FoldedState
const kFolding = 4; ///< Used for the FoldingState
const kLocking = 5; ///< Used for the LockingState
const kUnlocking = 6; ///< Used for the UnlockingState
const kNotify = 7;

let last_notification_time = 0;

let base_strain = 0;



function addRow(tableID) {

  var table = document.getElementById(tableID);

  var rowCount = table.rows.length;
  var row = table.insertRow(rowCount);

  var colCount = table.rows[1].cells.length;

  for(var i=0; i<colCount; i++) {

    var newcell = row.insertCell(i);

    newcell.innerHTML = table.rows[1].cells[i].innerHTML;
    //alert(newcell.childNodes);
    console.log(newcell)
    switch(newcell.childNodes[0].type) {
      case "text":
          newcell.childNodes[0].value = "1.0";
          break;
      case "checkbox":
          newcell.childNodes[0].checked = false;
          break;
      case "select-one":
          newcell.childNodes[0].selectedIndex = 0;
          break;
      
    }
  }
}

function deleteRow(tableID) {
  try {
  var table = document.getElementById(tableID);
  var rowCount = table.rows.length;

  for(var i=0; i<rowCount; i++) {
    var row = table.rows[i];
    var chkbox = row.cells[0].childNodes[0];
    if(null != chkbox && true == chkbox.checked) {
      if(rowCount <= 2) {
        alert("Cannot delete all the rows.");
        break;
      }
      table.deleteRow(i);
      rowCount--;
      i--;
    }


  }
  }catch(e) {
    alert(e);
  }
}

// $('body').on('DOMSubtreeModified', 'step_auto_table', function(){
//   console.log('changed');
//   getAutoSequence()
// });


function getAutoSequence(){
  let rows = document.querySelector('#dataTable').rows;

  durations = []
  labels = []

  for (var i = 1; i< rows.length; i++){
    let posture = parseInt(rows[i].querySelector("#posture").value);
    if(posture == 0){
      continue;
    }
    let posture_str = rows[i].querySelector("#posture").options[rows[i].querySelector("#posture").selectedIndex].text
    let duration = parseFloat(rows[i].querySelector("#duration").value);

    durations.push(duration)
    labels.push(i + ") " + posture_str.split('-')[0])
    console.log(i,posture,posture_str,duration)
  }

  if(labels.length == 0){
    return;
  }
  let cycle_time = durations.reduce((a, b) => a + b, 0)

  console.log(durations)
  console.log(labels)

  var d3 = Plotly.d3
  var format = d3.format(',02f')

  var text = durations.map((v, i) => `
    ${labels[i]}<br>
    ${format(v)} min<br>
    `)

  var data = [{
    values: durations,
    labels: labels,
    type: 'pie',
    sort:false,
    direction:'clockwise',
    text: text,
    hoverinfo: 'text',
    textinfo: 'percent'
  }];

  var layout = {
    // width: 100%
    paper_bgcolor: "rgba(0,0,0,0)",
    legend: {
      font:{"color":'#FFFFFF',family: 'Old Standard TT, serif',},

    },
    sort:false,
    direction:'clockwise',
    ascending:false,
    title: {
      font:{"color":'#FFFFFF',
        family: 'Old Standard TT, serif',
        size: 18,},
      text: "AutoMode Sequence -- total cycle time = "+ format(cycle_time) +" minutes"
    }
  };

  var config = {responsive: true}


  Plotly.newPlot('piechart', data, layout, config);

  var myPlot = document.getElementById('piechart');

  myPlot.on('plotly_click', function(data){
    var pts = '';
    for(var i=0; i < data.points.length; i++){
        pts = 'label(country) = '+ data.points[0].label + '\nvalue(%) = ' + data.points[0].value;
    }
    console.log("--------")
    console.log(data)
    // alert('Closest point clicked:\n\n'+pts);
    // console.log('Closest point clicked:\n\n'+pts);
    data.points[0].value = data.points[0].value + 1;
    // console.log(data.points[0].value);
    index = data.points[0].i;
    myPlot.data[0].values[index] +=1;
    Plotly.redraw('piechart');
  });
} 


function calibrate() {
  var txt;

  FlamingoBle.enableStreaming(true).then(value => {
    // fulfillment

    if (window.confirm("Please step off the chair, then press OK.")) {
      
      setTimeout(function(){ 
        let off_value = base_strain;

        if (window.confirm("Off value was "+off_value.toString()+"\n please step on the chair, then press OK.")) {
          
          setTimeout(function(){ 
            let on_value = base_strain;

            let upper_threshold = off_value + (on_value - off_value)*0.1;
            let lower_threshold = 0;

            FlamingoBle.setAwayUpperThreshold(upper_threshold).then(
              FlamingoBle.enableStreaming(false)).then(
                window.alert("Away value was     = " + off_value.toString() + "\n" + 
                             "Presence value was = " + on_value.toString() + "\n" + 
                             "--------------------------------------\n" +
                             "Upper threshold    = " + upper_threshold.toString() + "\n" + 
                             "Lower threshold    = " + lower_threshold.toString() )
              )

          }, 500);

        }else{
          FlamingoBle.enableStreaming(false)
        }

      }, 500);

    }else{
      FlamingoBle.enableStreaming(false)
    }


  }, reason => {
    // rejection
    alert("Something went wrong. Try again later.");
  });

}

document.getElementById('file')
    .addEventListener('change', function() {

    let filename = document.getElementById('file').files[0].name;

    let filenameSplit = filename.split('.');

    let fileExtension = filenameSplit[filenameSplit.length - 1];

    if (fileExtension != 'zip') {
      document.getElementById('OTA_STM_status').textContent = 'wrong file format';
      return;
    } else {

      var zipFile = document.getElementById('file').files[0];
      FlamingoBle.handleZipFile(zipFile)
        .then(function (fileResults) {
          // Execute updates based on fileResults
          fileResults.forEach(({ fileData, functionName }) => {
            if (functionName === 'OTA_v2_Update') {
              console.log("Executing STM32 OTA update.");
              FlamingoBle.performUpdate_STM_OTA(fileData);
            } else if (functionName === 'OTA_Update') {
              console.log("Executing ESP32 OTA update.");
              FlamingoBle.performUpdate_ESP_OTA(fileData);
            }
          });
        })
        .catch(function (error) {
          document.getElementById('OTA_STM_status').textContent = 'Wrong OTA file!';
          console.error('Error handling ZIP file:', error);
        });
    }

});



function dateToString(now){
  let today_time_string = sprintf('%i-%02i-%02i %i:%02i:%02i', now.getFullYear(), 
    now.getMonth() + 1, // January is 0
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds());

  return today_time_string;
}



function playSound(url) {
  const audio = new Audio(url);
  audio.volume = 0.3;
  audio.play();
}


var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
      content.style.borderStyle = "none";
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      content.style.borderStyle = "solid";
    }
  });
}

function openCity(evt, cityName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("city");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-amber", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " w3-amber";
}


//  Morris.Donut({
//   element: 'donut-example',
//   data: [
//   {label: "Nombre des Ecoles", value: 851},
//   {label: "Nombre des Apprenant", value: 3281},
//   {label: "Nombre des Formateur", value: 1912}
//   ],colors:['#ffb606','#0072f2','#f42a26'],
//   labelColor: '#ffffff'
  
// });



async function autoScan() {
  if(FlamingoBle.device){
    if(FlamingoBle.device.gatt.connected){
      return;
    }
  }

  await FlamingoBle.scanForDevice();
  
  // console.log("connect now..")
  setTimeout(connectIfFound, 1000);

    function connectIfFound(){
      if(FlamingoBle.device_found){
        connectDevice();
      }
    }
}


try{
  autoScan();
  var autoScanId = setInterval(autoScan, 5000);

}catch (ex)
{
  console.log("auto scan and connect is not supported..", ex)
}


// Credit: Mateusz Rybczonec

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

let TIME_LIMIT = chair_period;
let timeLeft = 0;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

startTimer();

function onTimesUp() {
  // clearInterval(timerInterval);
  document.getElementById("base-timer-label")
  $('#base_timer').hide()
}

function startTimer() {
  timerInterval = setInterval(() => {

    if(!FlamingoBle.device || FlamingoBle.device.gatt.connected == false){
      $('#base_timer').hide()
      return;
    }

    timeLeft = timeLeft - 1; 
    TIME_LIMIT = chair_period;

    let timeLeftDisplay = Math.max(timeLeft, 0)

    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeftDisplay
    );
    setCircleDasharray(timeLeftDisplay);
    setRemainingPathColor(timeLeftDisplay);

    if (chairMode == "auto" && timeLeft!=-1) {
      $('#base_timer').show()
    }else{
      onTimesUp();
    }
  }, 1000);

  updateTimerInterval = setInterval(() => {
    if(!FlamingoBle.device || FlamingoBle.device.gatt.connected == false){
      return;
    }

    // FlamingoBle.getAutoPeriod().then((response) => TIME_LIMIT = Math.floor(response*60) );
    FlamingoBle.getTimeToNextTransition().then((response) => timeLeft = Math.floor(response) );
    
  }, 3000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  } else {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(alert.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(info.color);
  }
}

function calculateTimeFraction(timeLeft) {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray(timeLeft) {
  const circleDasharray = `${(
    calculateTimeFraction(timeLeft) * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}

// Function to add a MOS Date to the dropdown
function addMOSDateToDropdown(dateString) {
  let dropdown = document.getElementById("inputMOSDate");

  let option = document.createElement("option");
  option.text = dateString;
  dropdown.add(option);
}


// Function to add a WiFi SSID to the dropdown
function addWifiSSIDToDropdown(wifiSSID) {
  let dropdown = document.getElementById("inputWiFiSSID");

  let option = document.createElement("option");
  option.text = wifiSSID;
  dropdown.add(option);
}

async function readWiFiSSIDsMultipleTimes() {
  try {
      const n = await FlamingoBle.getWiFiListCount();
      console.log("Reading WiFi list =", n);

      for (let i = 0; i < n; i++) {
          try {
              const setCountPromise = FlamingoBle.setWiFiListCount(i);

              if (setCountPromise instanceof Promise) {
                  await setCountPromise;
              } else {
                  console.error("Error: setWiFiListCount did not return a Promise");
                  continue; // Continue to the next iteration if setWiFiListCount doesn't return a Promise
              }

              const wifiSSID = await FlamingoBle.getWiFiSingleSSIDString();
              addWifiSSIDToDropdown(wifiSSID);
          } catch (error) {
              console.error("Error fetching WiFi SSID:", error);
          }
      }
  } catch (error) {
      console.error("Error fetching WiFi list count:", error);
  }

}

