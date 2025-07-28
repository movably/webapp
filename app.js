var r = g = b = 255; // White by default.

// Run chrome://bluetooth-internals to see if available

let url_string = window.location.href
var url = new URL(url_string);
let engineering_enabled = true
if(url.searchParams.get("engineering")=="false"){
  engineering_enabled = false;
}

if(url.searchParams.get("analytics")=="true"){
  document.querySelector('#state').classList.add('analytics');
}
let chairSerial = null
let set_device_info = url.searchParams.get("set_info")

let autoSlider = new Slider("slider1","slider1Title","slider1Value");
autoSlider.setProperties("Auto Period (min):","0.1","10", "min")
autoSlider.registerChanges(FlamingoBle.setAutoPeriod, 
    FlamingoBle.getAutoPeriod,
    FlamingoBle);

let vibroSlider = new Slider("vibroSlider","vibroSliderTitle","vibroSliderValue");
vibroSlider.setProperties("Vibration:","0","50", "%")
vibroSlider.registerChanges(FlamingoBle.setVibroStrength, 
    FlamingoBle.getVibroStrength,
    FlamingoBle);

let leftMotorSoundSlider = new Slider("leftSoundSlider","leftSoundSliderTitle","leftSoundSliderValue");
leftMotorSoundSlider.setProperties("Left sound:","0","50", "%")
leftMotorSoundSlider.registerChanges(FlamingoBle.setLeftMotorSoundStrength, 
    FlamingoBle.getLeftMotorSoundStrength,
    FlamingoBle);

let rightMotorSoundSlider = new Slider("rightSoundSlider","rightSoundSliderTitle","rightSoundSliderValue");
rightMotorSoundSlider.setProperties("Right sound:","0","50", "%")
rightMotorSoundSlider.registerChanges(FlamingoBle.setRightMotorSoundStrength, 
    FlamingoBle.getRightMotorSoundStrength,
    FlamingoBle);

let leftLegDutySetSlider = new Slider("leftLegDutySlider","leftLegLockDutyTitle","leftLegLockDutyValue");
leftLegDutySetSlider.setProperties("Left lock:","200","500", "ppm")
leftLegDutySetSlider.registerChanges(FlamingoBle.setLeftLegMotorLockStrength, 
    FlamingoBle.getLeftLegMotorLockStrength,
    FlamingoBle);

let clockUPDSlider = new Slider("clockUpdatebyMOS","clockUpdateMOSTitle","clockMOSUPDValue");
clockUPDSlider.setProperties("Left lock:","2","144", "min")
clockUPDSlider.registerChanges(FlamingoBle.setClockUpdateValue, 
    FlamingoBle.getclockUpdateValue,
    FlamingoBle);
    
let rightLegDutySetSlider = new Slider("rightLegDutySlider","rightLegLockDutyTitle","rightLegLockDutyValue");
rightLegDutySetSlider.setProperties("Right lock:","200","500", "ppm")
rightLegDutySetSlider.registerChanges(FlamingoBle.setRightLegMotorLockStrength, 
    FlamingoBle.getRightLegMotorLockStrength,
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

let userEmail = localStorage.getItem("flamingoUserEmail");
document.querySelector('#inputUserEmail').value = userEmail;

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
      FlamingoBle.startRealtimeEvents(handleRealtimeEvents);

      // FlamingoBle.getVelLimit().then(velSlider.handleRead);
      // FlamingoBle.getAccelLimit().then(accelSlider.handleRead);
      // FlamingoBle.getDeccelLimit().then(deccelSlider.handleRead);
      // FlamingoBle.getTrajVelLimit().then(trajVelSlider.handleRead);

      FlamingoBle.startErrorCodeEvents(handleErrorCodes);
      FlamingoBle.getErrorCodes();

      FlamingoBle.getChairConfiguredFlag().then(handleChairConfiguredChBox);
      FlamingoBle.getTriggerByMotion().then(handleTriggerByMotionEnable);
      FlamingoBle.getSerialNumber().then(handleDeviceSerial);
      FlamingoBle.getModelNumber().then(handleDeviceModel);
      FlamingoBle.getEmailString().then(handleDeviceEmail);
      FlamingoBle.getWiFiSSIDString().then(handleWiFiSSID);
      FlamingoBle.getTZInfoDeviceString().then(handleTZInfoString);
      FlamingoBle.getWiFiPWDString().then(handleWiFiPWD);
      FlamingoBle.getEnableVibroMotor().then(handleEnableVibroMotor);
      
      console.log("Connection setup completed, scheduling odometer updates...");
      
      // Update odometers initially with a delay to avoid GATT conflicts
      setTimeout(() => {
        console.log("Starting automatic odometer updates...");
        updateOdometersSimple();
        
        // Set up periodic odometer updates every 15 seconds (increased interval)
        setInterval(updateOdometersSimple, 15000);
      }, 3000);
    }
  })
  .catch(error => {
    document.querySelector('#state').classList.remove('connecting');
    // TODO: Replace with toast when snackbar lands.
    console.error('Argh!', error);
    console.log(error.messsage);

  });
}

document.querySelector('#inputUserEmail')
    .addEventListener('change', function() {
      console.log("user email changed")
      localStorage.setItem("flamingoUserEmail", document.querySelector('#inputUserEmail').value);
      userEmail = localStorage.getItem("flamingoUserEmail");
})


document.querySelector('#connect').addEventListener('click', function() {


  localStorage.setItem("flamingoUserEmail", document.querySelector('#inputUserEmail').value);
  userEmail = localStorage.getItem("flamingoUserEmail");


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
    FlamingoBle.getVibroStrength().then(vibroSlider.handleRead);
    FlamingoBle.getLeftMotorSoundStrength().then(leftMotorSoundSlider.handleRead);
    FlamingoBle.getRightMotorSoundStrength().then(rightMotorSoundSlider.handleRead);

    FlamingoBle.getLeftLegMotorLockStrength().then(leftLegDutySetSlider.handleRead);
    FlamingoBle.getRightLegMotorLockStrength().then(rightLegDutySetSlider.handleRead);

    FlamingoBle.getclockUpdateValue().then(clockUPDSlider.handleRead);

    FlamingoBle.getAutoModeSelector().then(handleAutoModeSelectorRead)

    if(engineering_enabled){
      document.querySelector('#state').classList.add('engineering');
      FlamingoBle.startRealtimeEvents(handleRealtimeEvents);

      // FlamingoBle.getVelLimit().then(velSlider.handleRead);
      // FlamingoBle.getAccelLimit().then(accelSlider.handleRead);
      // FlamingoBle.getDeccelLimit().then(deccelSlider.handleRead);
      // FlamingoBle.getTrajVelLimit().then(trajVelSlider.handleRead);

      FlamingoBle.startErrorCodeEvents(handleErrorCodes);
      FlamingoBle.getErrorCodes();

      FlamingoBle.startSPIErrorsCodeEvents(handleSPIErrors);
      FlamingoBle.getSPIErrorsCodes();

      FlamingoBle.startWiFiStatusCodeEvents(handleWiFiCodes);
      FlamingoBle.getWiFiStatusCodes();
      FlamingoBle.getWiFiEnableStatus().then(handleWiFiEnableCode);
      FlamingoBle.getWiFiSSIDString().then(handleWiFiSSID);
      FlamingoBle.getTZInfoDeviceString().then(handleTZInfoString);
      FlamingoBle.getWiFiPWDString().then(handleWiFiPWD);

      FlamingoBle.getChairConfiguredFlag().then(handleChairConfiguredChBox);
      FlamingoBle.getTriggerByMotion().then(handleTriggerByMotionEnable);
      FlamingoBle.getSerialNumber().then(handleDeviceSerial);
      FlamingoBle.getModelNumber().then(handleDeviceModel);
      FlamingoBle.getEmailString().then(handleDeviceEmail);
      FlamingoBle.getEnableVibroMotor().then(handleEnableVibroMotor);
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


  if(v.getUint8(2) == 0){
    // document.querySelector('#manualMode').checked = true;
    // document.getElementById('manualMode').checked = true;

    s.parentElement.MaterialSwitch.off();

    // document.querySelector('[name="effectSwitch"]:checked').id = 'manualMode';
    // console.log("manualMode")
  }else if(v.getUint8(2) == 1){
    // document.querySelector('#autoMode').checked = true;
    // document.getElementById('autoMode').checked = true;
    s.parentElement.MaterialSwitch.on();
    // document.querySelector('[name="effectSwitch"]:checked').id = 'autoMode';
    // console.log("autoMode")

  }
}


function handleChairEvents(event){
  v = event.target.value;
  console.log("-> chair state =", v.getUint8(0), v.getUint8(1), v.getUint8(2))

  leftSide = v.getUint8(0) == 0 ? "up":"down"

  rightSide = v.getUint8(1) == 0 ? "up":"down"

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
  //sendChairEventToCloud(leftSide, rightSide, chairMode, event_time);
}

let chair_period = 0;
function handlePeriodChange(event){
  v = event.target.value;
  chair_period = new Uint32Array(v.buffer)[0];
  console.log("-> period changed: ", chair_period, "sec = ", chair_period/60.0, "min");
}

function sendChairEventToCloud(left,right,mode, event_time){
  if(chairSerial == null){
    console.log("chair_id not set")
  }


  let time_string = sprintf('%i-%02i-%02i %i:%02i:%02i.%i', event_time.getFullYear(), 
    event_time.getMonth() + 1, // January is 0
    event_time.getDate(),
    event_time.getHours(),
    event_time.getMinutes(),
    event_time.getSeconds(),
    event_time.getMilliseconds())

  // console.log(time_string);

  $.ajax({
      url: "https://movably.fielden.com.au/api/chair-event",
      type: 'PUT',  
      data: JSON.stringify({
        serialNumber:chairSerial,
        userId:userEmail,
        time:time_string,
        leftLeg:left,
        rightLeg:right,
        mode:mode
      }),      
      headers: {
        "Content-Type" : "application/json",
        "API-KEY":"f3162d2f-e798-4b5e-ae59-9540d69dc56c",
        "Time-Zone":Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      success: function () {
        console.log("MOS event sent")
        FlamingoBle.sendEventAck(true);
      },
      error: function (e) {
        console.log("MOS error" + e);
        FlamingoBle.sendEventAck(false);
      }
  })
}

function handleWiFiEnableCode(value) {
  // Log the raw value to the console
  console.log("handleWiFiEnableCode() -> Raw Value:", value);

  let s = document.getElementById("wifi-switch")
  if(value == 0)
  {
    s.parentElement.MaterialSwitch.off();
  }else{
    s.parentElement.MaterialSwitch.on();
  }

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

function handleSPIErrors(event){
  // Assuming event.target.value is a Uint8Array containing the WiFi status code
  let spi_err_cnt = event.target.value.getUint16(0);
  spi_err_cnt = ((spi_err_cnt & 0xFF) << 8) | ((spi_err_cnt >> 8) & 0xFF);
  // Log the raw value to the console
  console.log("handleSPIErrors() -> Raw Value:", spi_err_cnt);

  let SPI_string = "SPI QoS errors: ";

  document.querySelector('#SPIErrorsString').textContent = SPI_string + spi_err_cnt;
}

function updateOdometers() {
  console.log("Updating odometers...");
  
  // Update left leg odometer first
  FlamingoBle.getLeftLegOdometer().then(value => {
    console.log("Left leg odometer value:", value);
    document.querySelector('#leftLegOdometerValue').value = value;
    
    // Update right leg odometer after a short delay
    setTimeout(() => {
      FlamingoBle.getRightLegOdometer().then(value => {
        console.log("Right leg odometer value:", value);
        document.querySelector('#rightLegOdometerValue').value = value;
      }).catch(error => {
        console.log("Error reading right leg odometer:", error);
        document.querySelector('#rightLegOdometerValue').value = "Error";
      });
    }, 500);
    
  }).catch(error => {
    console.log("Error reading left leg odometer:", error);
    document.querySelector('#leftLegOdometerValue').value = "Error";
    
    // Still try to read the right leg odometer even if left fails
    setTimeout(() => {
      FlamingoBle.getRightLegOdometer().then(value => {
        console.log("Right leg odometer value:", value);
        document.querySelector('#rightLegOdometerValue').value = value;
      }).catch(error => {
        console.log("Error reading right leg odometer:", error);
        document.querySelector('#rightLegOdometerValue').value = "Error";
      });
    }, 500);
  });
}

function updateOdometersSimple() {
  console.log("Updating odometers automatically...");
  
  // Update left leg odometer with simpler error handling
  FlamingoBle.getLeftLegOdometer().then(value => {
    console.log("Auto-update left leg odometer value:", value);
    document.querySelector('#leftLegOdometerValue').value = value;
  }).catch(error => {
    console.log("Auto-update error reading left leg odometer:", error.message);
    // Don't change the display value on error, keep the last known value
  });

  // Update right leg odometer with a delay to avoid conflicts
  setTimeout(() => {
    FlamingoBle.getRightLegOdometer().then(value => {
      console.log("Auto-update right leg odometer value:", value);
      document.querySelector('#rightLegOdometerValue').value = value;
    }).catch(error => {
      console.log("Auto-update error reading right leg odometer:", error.message);
      // Don't change the display value on error, keep the last known value
    });
  }, 1000);
}

function readLeftOdometerClicked() {
  console.log("Left odometer button clicked");
  document.querySelector('#leftLegOdometerValue').value = "Reading...";
  
  FlamingoBle.getLeftLegOdometer().then(value => {
    console.log("Left leg odometer button read value:", value);
    document.querySelector('#leftLegOdometerValue').value = value;
  }).catch(error => {
    console.log("Error reading left leg odometer via button:", error);
    document.querySelector('#leftLegOdometerValue').value = "Error";
  });
}

function readRightOdometerClicked() {
  console.log("Right odometer button clicked");
  document.querySelector('#rightLegOdometerValue').value = "Reading...";
  
  FlamingoBle.getRightLegOdometer().then(value => {
    console.log("Right leg odometer button read value:", value);
    document.querySelector('#rightLegOdometerValue').value = value;
  }).catch(error => {
    console.log("Error reading right leg odometer via button:", error);
    document.querySelector('#rightLegOdometerValue').value = "Error";
  });
}

// Global variable to store the auto-update interval
let odometerAutoUpdateInterval = null;

function startAutoUpdateClicked() {
  console.log("Starting manual auto-update for odometers");
  
  // Stop any existing interval
  if (odometerAutoUpdateInterval) {
    clearInterval(odometerAutoUpdateInterval);
  }
  
  // Start immediate update
  updateOdometersSimple();
  
  // Set up periodic updates
  odometerAutoUpdateInterval = setInterval(updateOdometersSimple, 15000);
  
  // Update button states
  document.querySelector('#startAutoUpdate').disabled = true;
  document.querySelector('#stopAutoUpdate').disabled = false;
  
  console.log("Auto-update started - updates every 15 seconds");
}

function stopAutoUpdateClicked() {
  console.log("Stopping auto-update for odometers");
  
  if (odometerAutoUpdateInterval) {
    clearInterval(odometerAutoUpdateInterval);
    odometerAutoUpdateInterval = null;
  }
  
  // Update button states
  document.querySelector('#startAutoUpdate').disabled = false;
  document.querySelector('#stopAutoUpdate').disabled = true;
  
  console.log("Auto-update stopped");
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
document.querySelector('#AutoMode3').addEventListener('click', selectAutoMode);
document.querySelector('#AutoMode4').addEventListener('click', selectAutoMode);
document.querySelector('#AutoMode5').addEventListener('click', selectAutoMode);

// document.querySelector('#manualMode').addEventListener('click', changeMode);
// document.querySelector('#autoMode').addEventListener('click', changeMode);
document.querySelector('#triggerWiFiConfiguredEnable').addEventListener('click', ChairConfiguredEnable);
document.querySelector('#triggerByMotionEnable').addEventListener('click', triggerByMotionEnable);
document.querySelector('#setDeviceInfo').addEventListener('click', setDeviceInfo);
document.querySelector('#setWiFiSettings').addEventListener('click', setDeviceWiFiSettings);
document.querySelector('#setTZInfoStringSettings').addEventListener('click', setDeviceTZInfoString);
document.querySelector('#setTZInfoStringSettings_read').addEventListener('click', readTZStringFromDevice);
document.querySelector('#setBrowserTZInfoStringSettings').addEventListener('click', setTZInfoAutomatically);




document.querySelector('#ConnectWiFiCommand').addEventListener('click', connectDeviceWiFiCommand);
document.querySelector('#DisconnecttWiFiCommand').addEventListener('click', disconnectDeviceWiFiCommand);

document.getElementById("auto-switch").addEventListener('click', changeModeToggle);
document.getElementById("wifi-switch").addEventListener('click', enableWiFiToggle);

document.querySelector('#enableVibroMotor').addEventListener('click', enableVibroMotorClicked);

// Odometer button event listeners
document.querySelector('#readLeftOdometer').addEventListener('click', readLeftOdometerClicked);
document.querySelector('#readRightOdometer').addEventListener('click', readRightOdometerClicked);
document.querySelector('#startAutoUpdate').addEventListener('click', startAutoUpdateClicked);
document.querySelector('#stopAutoUpdate').addEventListener('click', stopAutoUpdateClicked);

// Initialize auto-update button states
document.querySelector('#startAutoUpdate').disabled = false;
document.querySelector('#stopAutoUpdate').disabled = true;


function handleDeviceSerial(info){

  document.querySelector('#title2').textContent = "Connected to Flamingo Chair " + info;
  // document.querySelector('#titleDeviceSerial').textContent = "Serial #: " + info;
  document.querySelector('#inputSerial').value = info;
  chairSerial = info;
}

function handleDeviceModel(info){
  // document.querySelector('#titleDeviceModel').textContent = "Model #: " + info;
  document.querySelector('#inputModel').value = info;
}

function handleDeviceEmail(info){
  document.querySelector('#inputEmail').value = info;
}


function handleWiFiSSID(info){
  document.querySelector('#inputWiFiSSID').value = info;
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
  ssid = document.querySelector('#inputWiFiSSID').value;
  pwd = document.querySelector('#inputWiFiPWD').value;

  FlamingoBle.setWiFiSSIDString(ssid)
  .then(FlamingoBle.setWiFiPWDString(pwd))

  setTimeout(function(){ 
      FlamingoBle.getWiFiSSIDString().then(handleWiFiSSID);
      handleWiFiPWD("");
    }, 1000);

}

function handleTZInfoString(info){
  document.querySelector('#inputTZInfoString_id').value = info;
}

function setDeviceTZInfoString(){
  tz_info = document.querySelector('#inputTZInfoString_id').value;

  FlamingoBle.setTZInfoDeviceString(tz_info)
  
  setTimeout(function(){ 
      FlamingoBle.getTZInfoDeviceString().then(handleTZInfoString);
    }, 1000);

}

function readTZStringFromDevice()
{
  FlamingoBle.getTZInfoDeviceString().then(handleTZInfoString);
}

function setTZInfoAutomatically()
{
  FlamingoBle.setTZInfoDeviceString(Intl.DateTimeFormat().resolvedOptions().timeZone);

  setTimeout(function(){ 
    FlamingoBle.getTZInfoDeviceString().then(handleTZInfoString);
  }, 1000);
}

function setDeviceInfo(){
  model = document.querySelector('#inputModel').value;
  serial = document.querySelector('#inputSerial').value;
  email = document.querySelector('#inputEmail').value;

  console.log(serial)

  FlamingoBle.setModelNumber(model)
    .then(FlamingoBle.setSerialNumber(serial)
    .then(FlamingoBle.setEmailString(email)))

  setTimeout(function(){ 
      FlamingoBle.getSerialNumber().then(handleDeviceSerial);
      FlamingoBle.getModelNumber().then(handleDeviceModel);
      FlamingoBle.getEmailString().then(handleDeviceEmail);
    }, 1000);

}

function handleTriggerByMotionEnable(value){
  console.log("-> Trigger by Motion =")
  console.log(value)
  document.querySelector('#triggerByMotionEnable').checked = value;
}

function triggerByMotionEnable(){
  FlamingoBle.setTriggerByMotion(document.querySelector('#triggerByMotionEnable').checked)
    .then(_ => FlamingoBle.getTriggerByMotion())
    .then((value) => handleTriggerByMotionEnable(value));
}

function handleChairConfiguredChBox(value){
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(timezone);
  console.log("-> ChairConfigured =")
  console.log(value)
  document.querySelector('#triggerWiFiConfiguredEnable').checked = value;
}

function ChairConfiguredEnable(){
  FlamingoBle.setChairConfiguredFlag(document.querySelector('#triggerWiFiConfiguredEnable').checked)
    .then(_ => FlamingoBle.getChairConfiguredFlag())
    .then((value) => handleChairConfiguredChBox(value));
}


function handleEnableVibroMotor(value){
  console.log(value)
  document.querySelector('#enableVibroMotor').checked = value;
}

function enableVibroMotorClicked(){
  FlamingoBle.enableVibroMotor(document.querySelector('#enableVibroMotor').checked)
    .then(_ => FlamingoBle.getEnableVibroMotor())
    .then((value) => handleEnableVibroMotor(value));
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

function enableWiFiToggle() {
  var effect = document.getElementById("wifi-switch").checked;
  console.log("WiFi switch state = ", effect);
  FlamingoBle.setWiFiEnable(effect);
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

function download_csv(){
  let chart_data = document.getElementById('chart').data;

  let csvContent = "data:text/csv;charset=utf-8,";

  let header = "";

  header += "time,";

  for (i = 0; i < chart_data.length; i++) {
    header += chart_data[i].name;
    if(i < chart_data.length-1){
      header += ",";
    }else{
      header += "\r\n";
    }
  }
  csvContent += header;


  for (j = 0; j < chart_data[0].y.length; j++) {

    let row = "";
    row += chart_data[0].x[j] + ",";

    for (i = 0; i < chart_data.length; i++) {
      row += chart_data[i].y[j];
      if(i < chart_data.length-1){
        row += ",";
      }else{
        row += "\r\n";
      }
    }
    // console.log(row)

    csvContent += row;
  }

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Flamingo_data.csv");
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "my_data.csv".

}

function moveRight(){
  // console.log("moveRight")
  FlamingoBle.setToggle(1);
}
document.querySelector('#left').addEventListener('click', moveLeft);
document.querySelector('#right').addEventListener('click', moveRight);
document.querySelector('#download_csv').addEventListener('click', download_csv);



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

if(engineering_enabled){
  createNewPlotter();  
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

function handleRealtimeEvents(event){
  data_count++;
  let v = event.target.value;
  let time_in_sec = new Float32Array(v.buffer)[0];

  let left_angle = new Int16Array(v.buffer)[2]/45.5;
  let right_angle = new Int16Array(v.buffer)[3]/45.5;

  base_strain = new Uint32Array(v.buffer)[2];
  let base_std = new Float32Array(v.buffer)[3];

  let side_states = new Uint8Array(v.buffer)[16];//[12];
  let opto_values = new Uint8Array(v.buffer)[17];//[13];

  let left_state = side_states & 0x0F;
  let right_state = (side_states & 0xF0) >> 4;

  let left_folded = opto_values & 0x1;
  let left_seated = (opto_values >> 1) & 0x1;
  let left_unlocked = (opto_values >> 2) & 0x1;

  let right_folded = (opto_values >> 3) & 0x1;
  let right_seated = (opto_values >> 4) & 0x1;
  let right_unlocked = (opto_values >> 5) & 0x1;

  // pushNotificationMsg
  let notify = false;

  if(chairMode == "auto"){
    if(left_state != state_left_pre){
      if(left_state == kUnlocking || left_state == kSeating){
        notify = true;
      }
    }

    if(right_state != state_right_pre){
      if(right_state == kUnlocking || right_state == kSeating){
        notify = true;
      }
    }

    if(notify){
      let now = new Date;
      if((now.getTime() - last_notification_time) > 10000){
        pushNotificationMsg("Time to change postures!");
        last_notification_time = now.getTime();
      }
    }
  }


  // erase plotter if current time is less than the last time in the plotter 
  // meaning that it's a new session

  chart_data = document.getElementById('chart').data
  length = chart_data[0].x.length

  if(length>0){
    last_recorded_time = chart_data[0].x[length-1];
    if(time_in_sec < last_recorded_time){
      createNewPlotter();
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
    }
  }


  state_right_pre = right_state;
  state_left_pre = left_state;

  // xdata = [[time_in_sec], 
  //   [time_in_sec], 
  //   [time_in_sec], 
  //   [time_in_sec], 
  //   [time_in_sec], 
  //   [time_in_sec], 
  //   [time_in_sec], 
  //   [time_in_sec], 
  //   [time_in_sec], 
  //   [time_in_sec],
  //   [time_in_sec]];

  xbuffer[0].push(time_in_sec) 
  xbuffer[1].push(time_in_sec) 
  xbuffer[2].push(time_in_sec) 
  xbuffer[3].push(time_in_sec) 
  xbuffer[4].push(time_in_sec) 
  xbuffer[5].push(time_in_sec) 
  xbuffer[6].push(time_in_sec) 
  xbuffer[7].push(time_in_sec) 
  xbuffer[8].push(time_in_sec) 
  xbuffer[9].push(time_in_sec) 
  xbuffer[10].push(time_in_sec)
  xbuffer[11].push(time_in_sec)

  ybuffer[0].push(left_angle) 
  ybuffer[1].push(right_angle) 
  ybuffer[2].push(base_strain) 
  ybuffer[3].push(left_state) 
  ybuffer[4].push(right_state) 
  ybuffer[5].push(left_folded * 60) 
  ybuffer[6].push(left_seated * 61) 
  ybuffer[7].push(left_unlocked * 62) 
  ybuffer[8].push(right_folded * 70) 
  ybuffer[9].push(right_seated * 71) 
  ybuffer[10].push(right_unlocked * 72)
  ybuffer[11].push(base_std)

  // ydata = [[left_angle], 
  //   [right_angle], 
  //   [base_strain*100], 
  //   [left_state], 
  //   [right_state], 
  //   [left_folded * 60], 
  //   [left_seated * 61], 
  //   [left_unlocked * 62], 
  //   [right_folded * 70], 
  //   [right_seated * 71], 
  //   [right_unlocked * 72]];

  traces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  // xbuffer.push(xdata)
  // ybuffer.push(ydata)
  // tracesbuffer.push(traces)

  if(__lock == false && xbuffer[0].length>5){
    __lock = true

    // var self = this
    Plotly.extendTraces('chart', {
      x: xbuffer,
      y: ybuffer
    }, traces).then(function() {
      __lock = false
    })

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

    cnt++;
    range = 10;
    if(time_in_sec > range) {
          Plotly.relayout('chart',{
              xaxis: {
                  title: {
                    text: 'Time (seconds since device power on)',
                    font: {
                      family: 'Old Standard TT, serif',
                      size: 18,
                      color: '#ffffff'
                    }
                  },
                  range: [time_in_sec-range,time_in_sec],
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
              }
          });
      }
  }else{
    // console.log("ignored " + time_in_sec)
  }

  
}


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

    if(fileExtension != 'zip'){
      document.getElementById('output').textContent = 'wrong file format';
      return;
    }else{

      var zipFile = document.getElementById('file').files[0];
      FlamingoBle.handleZipFile(zipFile)
        .then(function ({ fileData, functionName }) {
          if (functionName === 'OTA_v2_Update') {
            console.log("Executing STM32 OTA update.");
            FlamingoBle.performUpdate_OTA_v2(fileData);
          } else if (functionName === 'OTA_Update') {
            console.log("Executing ESP32 OTA update.");
            FlamingoBle.performUpdate(fileData);
          }
        })
        .catch(function (error) {
          document.getElementById('output').textContent = 'Wrong OTA file!';
          console.error('Error handling ZIP file:', error);
        });
    }

})



function dateToString(now){
  let today_time_string = sprintf('%i-%02i-%02i %i:%02i:%02i', now.getFullYear(), 
    now.getMonth() + 1, // January is 0
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds());

  return today_time_string;
}




// UsageReporter.request(userEmail, dateToString(yesterday), dateToString(now));
// document.querySelector('#posture').addEventListener('change', getAutoSequence);
// document.querySelector('.duration').addEventListener('input', getAutoSequence);

function reportUsage(start, end){
  UsageReporter.request(userEmail, start, end);
  UsageReporter.requestTimeUsage(userEmail, start, end);
}

// var intervalId = setInterval(function() {
//   alert("Interval reached every 5s")
// }, 5000);

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


UsageReporter.getDailyUsages(userEmail);


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


