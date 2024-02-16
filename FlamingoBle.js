(function() {
  'use strict';

  let encoder = new TextEncoder('utf-8');
  let decoder = new TextDecoder('utf-8');

  const DISCOVERY_SERVICE_UUID = 0x180A
  // const MODEL_NUMBER_UUID = 0x2A24
  // const SERIAL_NUMBER_UUID = 0x2A25
  const FIRMWARE_REVISION_UUID = 0x2A26
  const HARDWARE_REVISION_UUID = 0x2A27
  const SOFTWARE_REVISION_UUID = 0x2A28
  const MANUFACTURER_NAME_UUID = 0x2A29

  const CHAIR_SERVICE_UUID = "730c0001-7ec9-4dd5-ba24-44a04e14cf08";

  const AUTO_MODE_UUID = "730c0003-7ec9-4dd5-ba24-44a04e14cf08";
  const AUTO_PERIOD_UUID = "730c0002-7ec9-4dd5-ba24-44a04e14cf08";
  const CHAIR_STATE_EVENT_UUID = "730c0005-7ec9-4dd5-ba24-44a04e14cf08";
  const CHAIR_TOGGLE_UUID = "730c0006-7ec9-4dd5-ba24-44a04e14cf08";
  const SEND_EVENTS_UUID = "730c0007-7ec9-4dd5-ba24-44a04e14cf08";
  const EVENT_ACK_UUID = "730c0008-7ec9-4dd5-ba24-44a04e14cf08";
  const CHAIR_STATE_UUID = "730c0009-7ec9-4dd5-ba24-44a04e14cf08";
  const AUTO_MODE_SELECTOR_UUID = "730c000a-7ec9-4dd5-ba24-44a04e14cf08";
  const TIME_TO_NEXT_TRANSITION_UUID = "730c000b-7ec9-4dd5-ba24-44a04e14cf08";

  const ENGINEERING_SERVICE_UUID = "1b25ee00-dadf-11eb-8d19-0242ac130003";

  const VEL_UUID = "1b25ee01-dadf-11eb-8d19-0242ac130003";
  const ACCEL_UUID = "1b25ee02-dadf-11eb-8d19-0242ac130003";
  const DECCEL_UUID = "1b25ee03-dadf-11eb-8d19-0242ac130003";
  const TRAJ_VEL_UUID = "1b25ee04-dadf-11eb-8d19-0242ac130003";
  const REALTIME_UUID = "1b25ee05-dadf-11eb-8d19-0242ac130003";
  const ERRORCODES_UUID = "1b25ee06-dadf-11eb-8d19-0242ac130003";
  const ERRORCODES_SPI_UUID = "1b25ee0f-dadf-11eb-8d19-0242ac130003";
  const CHAIR_CONFIGURED_FLAG_UUID = "1b25ee10-dadf-11eb-8d19-0242ac130003";
  const TRIGGER_BY_MOTION_UUID = "1b25ee07-dadf-11eb-8d19-0242ac130003";
  const STREAMING_ENABLE_UUID = "1b25ee08-dadf-11eb-8d19-0242ac130003";
  const BASE_AWAY_LOWER_THRESHOLD_UUID = "1b25ee09-dadf-11eb-8d19-0242ac130003";
  const BASE_AWAY_UPPER_THRESHOLD_UUID = "1b25ee0a-dadf-11eb-8d19-0242ac130003";

  const LEFT_SEAT_MOTOR_SOUND_UUID =  "1b25ee0d-dadf-11eb-8d19-0242ac130003";
  const RIGHT_SEAT_MOTOR_SOUND_UUID = "1b25ee0e-dadf-11eb-8d19-0242ac130003";


  const CONFIGURATION_SERVICE_UUID = "7f1a0001-252d-4f8b-baea-6bfc6b255ab6";

  const MODEL_NUMBER_UUID =     "7f1a0002-252d-4f8b-baea-6bfc6b255ab6";
  const SERIAL_NUMBER_UUID =    "7f1a0003-252d-4f8b-baea-6bfc6b255ab6";
  const USER_NAME_UUID =        "7f1a0004-252d-4f8b-baea-6bfc6b255ab6";

  const OTAServiceUUID = "d0274711-aefa-42c3-93f1-535a09812c37";
  const BeginUUID = "403b76d9-9bc6-4837-8112-cd62516ef214";
  const DataUUID = "d0270001-aefa-42c3-93f1-535a09812c37";
  const OTAService_OTA_v2_UUID = "d0274711-aefa-42c3-93f1-535a09812c37";
  const Status_OTA_v2_UUID = "399fa500-b71f-4681-950c-2a1cb307c629";
  const Begin_OTA_v2_UUID = "403b76d9-9bc6-4837-8112-cd62516ef315";
  const Data_OTA_v2_UUID = "d0270001-aefa-42c3-93f1-535a09812d38";
  const OTA_INIT = 0;
  const OTA_BEGIN = 1;
  const OTA_INPROGRESS = 2;
  const OTA_SUCCESS = 3;

  const WiFiserviceUUID         = "73e80001-24f7-464d-8de7-3b1e1bfb5dfa";
  const WiFienableWifiUUID      = "73e80002-24f7-464d-8de7-3b1e1bfb5dfa";
  const WiFissidUUID            = "73e80003-24f7-464d-8de7-3b1e1bfb5dfa";
  const WiFipasswordUUID        = "73e80004-24f7-464d-8de7-3b1e1bfb5dfa";
  const WiFistatusUUID          = "73e80005-24f7-464d-8de7-3b1e1bfb5dfa";
  const WiFicommandUUID         = "73e80006-24f7-464d-8de7-3b1e1bfb5dfa";

  const TIME_SERVICE_UUID = 0x1805;
  const CURRENT_TIME_UUID = 0x2A2B;

  class FlamingoBle {
    constructor() {
      this.device = null;
      this.server = null;
      this._characteristics = new Map();
      this._isEffectSet = false;
      this._debug = false;
      this.automode_enabled = false;
      this.automode_period = 0;
      this.automode_period_response = null;
      this.device_found = false;
      this.data = {
        'sw': 'unknown', 
        'fw': 'unknown',
        'getVersion': function() {
          return this.sw+"_"+this.fw
        }
      };

    }
    request(onDisconnect) {
      // let options = {filters:[{services:[ CANDLE_SERVICE_UUID ]}]};

      // let options = {filters:[{services:[ CHAIR_SERVICE_UUID ]}],
      //                optionalServices: ['battery_service']};
      let options = {//acceptAllDevices: true,
                      filters:[{namePrefix: 'Movably Chair'}],
                      //filters:[{namePrefix: 'Flamingo'}],
                      // filters:[{services:[ CHAIR_SERVICE_UUID ]}],
                      optionalServices: [CHAIR_SERVICE_UUID, WiFiserviceUUID, ENGINEERING_SERVICE_UUID, CONFIGURATION_SERVICE_UUID, TIME_SERVICE_UUID, OTAServiceUUID, DISCOVERY_SERVICE_UUID]};
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        this.device.addEventListener('gattserverdisconnected', onDisconnect);

      })
    }

    async scanForDevice()
    {
      this.device_found = false;
      //let devices = await navigator.bluetooth.getDevices();
      //console.log(devices);
      //for (let device of devices) 
     // {
        // Start a scan for each device before connecting to check that they're in
        // range.
        /*
        let abortController = new AbortController();
        device.addEventListener('advertisementreceived', async (evt) => 
        {
          // Stop the scan to conserve power on mobile devices.
          abortController.abort();

     
          // Advertisement data can be read from |evt|.
          let deviceName = evt.name;
          let uuids = evt.uuids;
          let appearance = evt.appearance;
          let pathloss = evt.txPower - evt.rssi;
          let manufacturerData = evt.manufacturerData;
          let serviceData = evt.serviceData;
     
          console.log(deviceName);
          console.log(manufacturerData);

          // At this point, we know that the device is in range, and we can attempt
          // to connect to it.
          // await evt.device.gatt.connect();
          if(deviceName=="Flamingo"){
            this.device_found = true;
            this.device = evt.device;
          }
        });
        */
        

      //}
      //await device.watchAdvertisements({signal: abortController.signal});
    }
    
    async connect(engineering_enabled) {
      console.log("connect()")
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      }
      const server = await this.device.gatt.connect()

      this.server = server;

      let service = await server.getPrimaryService(CHAIR_SERVICE_UUID);

      this._cacheCharacteristic(service, AUTO_MODE_UUID);
      this._cacheCharacteristic(service, AUTO_PERIOD_UUID);
      this._cacheCharacteristic(service, CHAIR_STATE_EVENT_UUID);
      this._cacheCharacteristic(service, CHAIR_TOGGLE_UUID);
      this._cacheCharacteristic(service, SEND_EVENTS_UUID);
      this._cacheCharacteristic(service, EVENT_ACK_UUID);
      this._cacheCharacteristic(service, CHAIR_STATE_UUID);
      this._cacheCharacteristic(service, AUTO_MODE_SELECTOR_UUID);
      this._cacheCharacteristic(service, TIME_TO_NEXT_TRANSITION_UUID);

      service = await server.getPrimaryService(DISCOVERY_SERVICE_UUID);
      this._cacheCharacteristic(service, FIRMWARE_REVISION_UUID);
      this._cacheCharacteristic(service, SOFTWARE_REVISION_UUID);


      service = await server.getPrimaryService(CONFIGURATION_SERVICE_UUID);

      this._cacheCharacteristic(service, MODEL_NUMBER_UUID);
      this._cacheCharacteristic(service, USER_NAME_UUID);
      this._cacheCharacteristic(service, SERIAL_NUMBER_UUID);


      service = await server.getPrimaryService(ENGINEERING_SERVICE_UUID);
      this._cacheCharacteristic(service, VEL_UUID);
      this._cacheCharacteristic(service, ACCEL_UUID);
      this._cacheCharacteristic(service, DECCEL_UUID);
      this._cacheCharacteristic(service, TRAJ_VEL_UUID);
      this._cacheCharacteristic(service, REALTIME_UUID);
      this._cacheCharacteristic(service, ERRORCODES_UUID);
      this._cacheCharacteristic(service, ERRORCODES_SPI_UUID);
      this._cacheCharacteristic(service, CHAIR_CONFIGURED_FLAG_UUID);
      this._cacheCharacteristic(service, TRIGGER_BY_MOTION_UUID);
      this._cacheCharacteristic(service, STREAMING_ENABLE_UUID);
      this._cacheCharacteristic(service, BASE_AWAY_LOWER_THRESHOLD_UUID);
      this._cacheCharacteristic(service, BASE_AWAY_UPPER_THRESHOLD_UUID);
      this._cacheCharacteristic(service, LEFT_SEAT_MOTOR_SOUND_UUID);
      this._cacheCharacteristic(service, RIGHT_SEAT_MOTOR_SOUND_UUID);

      service = await server.getPrimaryService(WiFiserviceUUID);
      this._cacheCharacteristic(service, WiFienableWifiUUID);
      this._cacheCharacteristic(service, WiFissidUUID);
      this._cacheCharacteristic(service, WiFipasswordUUID);
      this._cacheCharacteristic(service, WiFistatusUUID);
      this._cacheCharacteristic(service, WiFicommandUUID);

      service = await server.getPrimaryService(TIME_SERVICE_UUID);
      this._cacheCharacteristic(service, CURRENT_TIME_UUID);


      service = await server.getPrimaryService(OTAServiceUUID);
      this._cacheCharacteristic(service, BeginUUID);
      this._cacheCharacteristic(service, DataUUID);
      this._cacheCharacteristic(service, Begin_OTA_v2_UUID);
      this._cacheCharacteristic(service, Data_OTA_v2_UUID);
      this._cacheCharacteristic(service, Status_OTA_v2_UUID);

      
             
    }

    /* Candle Service */

    handleAutoModeRead(data){
      // console.log("automode")
      this.automode_enabled = data.getUint8(0)
      // console.log(this.automode_enabled)
    }

    getAutoMode(){
      // console.log("reading automode")
      this._readCharacteristicValue(AUTO_MODE_UUID).then((response) => this.handleAutoModeRead(response))  
    }

    handleAutoPeriodRead(data){
      // console.log("auto period")
      // console.log(data)
      this.automode_period_response = data;
      this.automode_period = new Uint32Array(data.buffer)[0]/60.0;
      // console.log(this.automode_period)
      return this.automode_period;
    }

    getAutoPeriod(){
      // console.log("reading auto period")
      return this._readCharacteristicValue(AUTO_PERIOD_UUID).then((response) => this.handleAutoPeriodRead(response))  
    }

    setAutoPeriod(value) {
      value = value * 60;
      return this._writeCharacteristicValue(AUTO_PERIOD_UUID, new Uint32Array([value]))
    }

    async startListenAutoPeriod(listener) {
      let characteristic = this._characteristics.get(AUTO_PERIOD_UUID);
      return await characteristic.startNotifications()
      .then(_ => {
        characteristic.addEventListener('characteristicvaluechanged', listener);
      });
    }

    getSwVersion(){
      return this._readCharacteristicValue(SOFTWARE_REVISION_UUID).then((response) => this.data.sw = this._decodeString(response)) 
    }

    getFwVersion(){
      return this._readCharacteristicValue(FIRMWARE_REVISION_UUID).then((response) => this.data.fw = this._decodeString(response)) 
    }
    
    setMode(mode) {
      this._writeCharacteristicValue(AUTO_MODE_UUID, new Uint8Array([mode]))
    }

    setToggle(side) {
      this._writeCharacteristicValue(CHAIR_TOGGLE_UUID, new Uint8Array([side]))
    }
    
    getChairEvent(){
        return this._readCharacteristicValue(CHAIR_STATE_UUID)
    }

    setAutoModeSelector(autoType){
      this._writeCharacteristicValue(AUTO_MODE_SELECTOR_UUID, new Uint8Array([autoType]))
    }

    getAutoModeSelector(){
      return this._readCharacteristicValue(AUTO_MODE_SELECTOR_UUID).then((response) => response.getUint8(0));  

    }

    getTimeToNextTransition(){
      // console.log("reading accel limit")
      return this._readCharacteristicValue(TIME_TO_NEXT_TRANSITION_UUID).then((response) => this.handleFloatReading(response))  
    }
    
    async startListenChairStateRead(listener) {
      let characteristic = this._characteristics.get(CHAIR_STATE_UUID);
      return await characteristic.startNotifications()
      .then(_ => {
        characteristic.addEventListener('characteristicvaluechanged', listener);
      });
    }

    async startListenChairEvents(listener) {
      let characteristic = this._characteristics.get(CHAIR_STATE_EVENT_UUID);
      return await characteristic.startNotifications()
      .then(_ => {
        characteristic.addEventListener('characteristicvaluechanged', listener);
      });
    }

    stopListenChairEvents(listener) {
      let characteristic = this._characteristics.get(CHAIR_STATE_EVENT_UUID);
      return characteristic.stopNotifications()
      .then(_ => {
        characteristic.removeEventListener('characteristicvaluechanged', listener);
      });
    }

    enableChairEvents(){
      this._writeCharacteristicValue(SEND_EVENTS_UUID, new Uint8Array([1]))
    }

    sendEventAck(success){
      this._writeCharacteristicValue(EVENT_ACK_UUID, new Uint8Array([success]))
    }

    /* Time Service */
    setCurrentTime(){
      let now = new Date;

      let time_array = new Uint8Array([now.getFullYear() & 0xff, 
                          (now.getFullYear()>>8) & 0xff,
                          now.getMonth() + 1,
                          now.getDate(),
                          now.getHours(),
                          now.getMinutes(),
                          now.getSeconds(),
                          0,
                          0,
                          0])
      this._writeCharacteristicValue(CURRENT_TIME_UUID, time_array);
    }


    /* Engineering Service */

    async startRealtimeEvents(listener) {
      let characteristic = this._characteristics.get(REALTIME_UUID);
      return await characteristic.startNotifications()
      .then(_ => {
        characteristic.addEventListener('characteristicvaluechanged', listener);
      });
    }

    stopRealtimeEvents(listener) {
      let characteristic = this._characteristics.get(REALTIME_UUID);
      return characteristic.stopNotifications()
      .then(_ => {
        characteristic.removeEventListener('characteristicvaluechanged', listener);
      });
    }

    async startWiFiStatusCodeEvents(listener) {
      let characteristic = this._characteristics.get(WiFistatusUUID);
      return await characteristic.startNotifications()
      .then(_ => {
        characteristic.addEventListener('characteristicvaluechanged', listener);
      });
    }

    getWiFiStatusCodes(){
      return this._readCharacteristicValue(WiFistatusUUID)
    }

    async startSPIErrorsCodeEvents(listener) {
      let characteristic = this._characteristics.get(ERRORCODES_SPI_UUID);
      return await characteristic.startNotifications()
      .then(_ => {
        characteristic.addEventListener('characteristicvaluechanged', listener);
      });
    }

    getSPIErrorsCodes(){
      return this._readCharacteristicValue(ERRORCODES_SPI_UUID)
    }

    async startWiFiEnableStatus(listener) {
      let characteristic = this._characteristics.get(WiFienableWifiUUID);
      return await characteristic.startNotifications()
      .then(_ => {
        characteristic.addEventListener('characteristicvaluechanged', listener);
      });
    }

    getWiFiEnableStatus(){
      return this._readCharacteristicValue(WiFienableWifiUUID).then((response) => this._decodeUint8(response)) 
    }

    async startErrorCodeEvents(listener) {
      let characteristic = this._characteristics.get(ERRORCODES_UUID);
      return await characteristic.startNotifications()
      .then(_ => {
        characteristic.addEventListener('characteristicvaluechanged', listener);
      });
    }

    getErrorCodes(){
      return this._readCharacteristicValue(ERRORCODES_UUID)
    }

    handleFloatReading(data){
      // console.log(data)
      let val = new Float32Array(data.buffer)[0]
      // console.log(val)
      return val;
    }

    handleUint32Reading(data){
      // console.log(data)
      let val = new Uint32Array(data.buffer)[0]
      // console.log(val)
      return val;
    }

    getVelLimit(){
      // console.log("reading vel limit")
      return this._readCharacteristicValue(VEL_UUID).then((response) => this.handleFloatReading(response))  
    }

    setVelLimit(value) {
      return this._writeCharacteristicValue(VEL_UUID, new Float32Array([value]))
    }

    getAccelLimit(){
      // console.log("reading accel limit")
      return this._readCharacteristicValue(ACCEL_UUID).then((response) => this.handleFloatReading(response))  
    }

    setAccelLimit(value) {
      return this._writeCharacteristicValue(ACCEL_UUID, new Float32Array([value]))
    }

    getDeccelLimit(){
      // console.log("reading deccel limit")
      return this._readCharacteristicValue(DECCEL_UUID).then((response) => this.handleFloatReading(response))  
    }

    setDeccelLimit(value) {
      return this._writeCharacteristicValue(DECCEL_UUID, new Float32Array([value]))
    }

    getTrajVelLimit(){
      // console.log("reading traj vel limit")
      return this._readCharacteristicValue(TRAJ_VEL_UUID).then((response) => this.handleFloatReading(response))  
    }

    setTrajVelLimit(value) {
      return this._writeCharacteristicValue(TRAJ_VEL_UUID, new Float32Array([value]))
    }

    setTriggerByMotion(enable) {
      return this._writeCharacteristicValue(TRIGGER_BY_MOTION_UUID, new Uint8Array([enable]))
    }

    getTriggerByMotion(){
      // console.log("reading automode")
      return this._readCharacteristicValue(TRIGGER_BY_MOTION_UUID).then((response) => this._decodeUint8(response))  
    }

    setChairConfiguredFlag(enable) {
      return this._writeCharacteristicValue(CHAIR_CONFIGURED_FLAG_UUID, new Uint8Array([enable]))
    }

    getChairConfiguredFlag(){
      return this._readCharacteristicValue(CHAIR_CONFIGURED_FLAG_UUID).then((response) => this._decodeUint8(response))  
    }

    enableStreaming(enable) {
      return this._writeCharacteristicValue(STREAMING_ENABLE_UUID, new Uint8Array([enable]))
    }

    getStreamingEnable(){
      // console.log("reading automode")
      return this._readCharacteristicValue(STREAMING_ENABLE_UUID).then((response) => this._decodeUint8(response))  
    }

    setAwayLowerThreshold(value) {
      return this._writeCharacteristicValue(BASE_AWAY_LOWER_THRESHOLD_UUID, new Uint32Array([value]))
    }

    getAwayLowerThreshold(){
      return this._readCharacteristicValue(BASE_AWAY_LOWER_THRESHOLD_UUID).then((response) => this.handleUint32Reading(response))  
    }

    setAwayUpperThreshold(value) {
      return this._writeCharacteristicValue(BASE_AWAY_UPPER_THRESHOLD_UUID, new Uint32Array([value]))
    }

    getAwayUpperThreshold(){
      return this._readCharacteristicValue(BASE_AWAY_UPPER_THRESHOLD_UUID).then((response) => this.handleUint32Reading(response))  
    }

    setLeftMotorSoundStrength(strength){
      this._writeCharacteristicValue(LEFT_SEAT_MOTOR_SOUND_UUID, new Uint8Array([strength]))

    }

    getLeftMotorSoundStrength(){
      return this._readCharacteristicValue(LEFT_SEAT_MOTOR_SOUND_UUID).then((response) => response.getUint8(0));  
    }

    setRightMotorSoundStrength(strength){
      this._writeCharacteristicValue(RIGHT_SEAT_MOTOR_SOUND_UUID, new Uint8Array([strength]))

    }

    getRightMotorSoundStrength(){
      return this._readCharacteristicValue(RIGHT_SEAT_MOTOR_SOUND_UUID).then((response) => response.getUint8(0));  
    }
    //////////////////////////

// Define a function to update both left and right motor sound strength
setBothMotorSoundStrength(value) {
  this.setLeftMotorSoundStrength(value);
  this.setRightMotorSoundStrength(value);
}

    /* Discovery Service */

    getModelNumber(){
      return this._readCharacteristicValue(MODEL_NUMBER_UUID).then((response) => this._decodeString(response))  
    }

    setModelNumber(str){
      return this._writeCharacteristicValue(MODEL_NUMBER_UUID,this._encodeString(str))
    }

    getEmailString(){
      return this._readCharacteristicValue(USER_NAME_UUID).then((response) => this._decodeString(response))  
    }

    setEmailString(str){
      return this._writeCharacteristicValue(USER_NAME_UUID,this._encodeString(str))
    }

    getSerialNumber(){
      return this._readCharacteristicValue(SERIAL_NUMBER_UUID).then((response) => this._decodeString(response))  
    }

    getWiFiSSIDString(){
      return this._readCharacteristicValue(WiFissidUUID).then((response) => this._decodeString(response))  
    }

    setWiFiSSIDString(str){
      return this._writeCharacteristicValue(WiFissidUUID,this._encodeString(str))
    }

    getWiFiPWDString(){
      return this._readCharacteristicValue(WiFipasswordUUID).then((response) => this._decodeString(response))  
    }

    setWiFiPWDString(str){
      return this._writeCharacteristicValue(WiFipasswordUUID,this._encodeString(str))
    }

    setWiFiEnable(mode) {
      console.log("setWiFiEnable() = ", mode);
      this._writeCharacteristicValue(WiFienableWifiUUID, new Uint8Array([mode]))
    }

    issueWiFiCommand(cmd) {
      console.log("issueWiFiCommand() = ", cmd);
      this._writeCharacteristicValue(WiFicommandUUID, new Uint8Array([cmd]))
    }


    setSerialNumber(str){
      return this._writeCharacteristicValue(SERIAL_NUMBER_UUID,this._encodeString(str))  
    }
    /* Battery Service */

    getBatteryLevel() {
      return this._readCharacteristicValue('battery_level')
      .then(data => data.getUint8(0));
    }

    /* Utils */

    async _cacheCharacteristic(service, characteristicUuid) {
      // return service.getCharacteristic(characteristicUuid)
      // .then(characteristic => {
      //   this._characteristics.set(characteristicUuid, characteristic);
      // });
      try{
        let characteristic = await service.getCharacteristics(characteristicUuid);
        this._characteristics.set(characteristicUuid, characteristic[0]);
      } catch(error) {
        console.log(error);
      }
    }
    async _readCharacteristicValue(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      let value = await characteristic.readValue();
      return value;
    }

    async _writeCharacteristicValue(characteristicUuid, value) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // if (this._debug) {
      //   console.debug('WRITE', characteristic.uuid, value);
      // }
      return await characteristic.writeValue(value);
    }
    _decodeString(data) {
      return decoder.decode(data);
    }
    _encodeString(data) {
      return encoder.encode(data);
    }

    _decodeFloat(data){
      return new Uint32Array(data)[0];
    }

    _decodeUint8(data){
      return data.getUint8(0);
    }

//------------------------------------STM32 update routine---------------------------------------------

async performUpdate_OTA_v2(buffer){

  try {
    // start the process
    var lengthAsBytes = buffer.length;

    try {
      console.log('Setting Characteristic User Description...');
      await this._writeCharacteristicValue(Begin_OTA_v2_UUID,new Uint32Array([lengthAsBytes]));

      var outputString = "Successfully wrote OTA Begin";
      document.getElementById('output').textContent = outputString;
      console.log(outputString);

    } catch(error) {
      var outputString = "FAILED: OTA did not start"  + error;
      document.getElementById('output').textContent = outputString;
      console.log(outputString);
    }



    // read it back
    var readResult = await this._readCharacteristicValue(Begin_OTA_v2_UUID);
    var res = new Uint32Array(readResult.buffer)[0]
    console.log(readResult)
    console.log(res)
    if (res == OTA_BEGIN)
    {
        var outputString = "Entered OTA Begin successfully";
        document.getElementById('output').textContent = outputString;
        console.log(outputString);
    }
    else
    {
        var outputString = "FAILED: OTA failed to read or nvalid OTA state {state}" + readResult;
        document.getElementById('output').textContent = outputString;
        console.log(outputString);
        return false;
    }


    var bytesSent = 0;
    var interval = 1;
    var maxWrite = 250;
    var startTime = Date.now();
    while (bytesSent < buffer.length)
    {
        // extract a subbuffer of, at most, 20 bytes to send
        var bytesToSend = Math.min(maxWrite , buffer.length - bytesSent);
        try
        {
            await this._writeCharacteristicValue(Data_OTA_v2_UUID, buffer.subarray(bytesSent, bytesSent + bytesToSend));

            // result = await _otaDataChar.WriteValueAsync( buffer.AsBuffer( bytesSent, bytesToSend ) );
            if(bytesSent < maxWrite){
              var mins = (Date.now() - startTime)/1000.0 / 60.0;

              var outputString = sprintf("#1Done! - %i bytes sent in %7.2f mins" ,bytesSent, mins);
              document.getElementById('output').textContent = outputString;
              console.log(outputString);
            }
        }
        catch (ex)
        {
            if (bytesToSend <= maxWrite )
            {
                bytesSent += bytesToSend;
                var mins = (Date.now() - startTime)/1000.0 / 60.0;
                // the last call will abort because the system will restart
                // need to start the reconnect process
                // FlashProgressChanged?.Invoke( null, new FlashProgressEventArgs( ) { Progress = $"Done - {bytesSent} bytes sent in {mins:F2} mins" } );
                var outputString = sprintf("#2Done!! - %i bytes sent in %7.2f mins" ,bytesSent, mins);

                document.getElementById('output').textContent = outputString;
                console.log(outputString);
                return true;
            }else{
              console.log("FAILED: to send OTA data" );
              return false;
            }
        }

        bytesSent += bytesToSend;
        if ((interval++ % 2) == 0)
        {
            var percentComplete = bytesSent*100 / buffer.length;
            var bytesRemaining = buffer.length - bytesSent;
            var secsPassed = (Date.now() - startTime)/1000.0;
            var bytesPerSecond = bytesSent / secsPassed;
            var minsRemaining = bytesRemaining / bytesPerSecond / 60.0;
            // FlashProgressChanged?.Invoke( null, new FlashProgressEventArgs( ) { Progress=$"{percentComplete}% sent - {bytesRemaining} bytes remaining, {minsRemaining:F2} mins remaining" } );

            var outputString = sprintf("%%%i sent, %3.2f mins remaining" ,percentComplete, minsRemaining);

            document.getElementById('output').textContent = outputString;
            // console.log(outputString);
        }
    }

    var readUpdateStatus = await this._readCharacteristicValue(Status_OTA_v2_UUID);
    // Assuming readResult is a buffer containing the data read from the characteristic
    // Convert the buffer to a Uint32Array with a length of 3
    var dataArray = new Uint32Array(readUpdateStatus.buffer, 0, 3);
    // Log the raw read result
    console.log(readUpdateStatus);
    // Log the interpreted array
    console.log(dataArray);

    var pagesToUpdate = dataArray[2];
    var pagesUpdated = dataArray[1];
    var updateStatus = dataArray[0];

    var core0UpdateInProgress = 1;

    while((pagesUpdated <= pagesToUpdate) && core0UpdateInProgress)
    {
        readUpdateStatus = await this._readCharacteristicValue(Status_OTA_v2_UUID);
        var dataArray = new Uint32Array(readUpdateStatus.buffer, 0, 3);
        console.log(readUpdateStatus);
        console.log(dataArray);
        var pagesToUpdate = dataArray[2];
        var pagesUpdated = dataArray[1];
        var updateStatus = dataArray[0];

        switch(updateStatus)
        {
          case 9:
            var outputString = sprintf("Transmiting to CORE0 PAGE %i / %i " ,pagesUpdated, pagesToUpdate);
          break;
          case 11:
          case 13: 
            var outputString = sprintf("Writing to CORE0 Flash PAGE %i / %i " ,pagesUpdated, pagesToUpdate);
          break;
          case 4: 
            if(pagesUpdated == 0)
            {
              var outputString = sprintf("Transmiting to CORE0 PAGE %i / %i " ,pagesUpdated, pagesToUpdate);
            }else{
              var outputString = sprintf("!Update COMPLETED!");
              core0UpdateInProgress = 0;
            }

          break;
        }

        document.getElementById('output').textContent = outputString;
    }

    // finished sending data

  }
  catch (ex)
  {
    var outputString = "Flash exception" + ex ;
    document.getElementById('output').textContent = outputString;
    console.log(outputString);
  }
  return false;

}

handleZipFile(zipBlob) {
  return new Promise((resolve, reject) => {
    var zip = new JSZip();

    zip.loadAsync(zipBlob)
      .then(function (zip) {
        // Check if "FlamingoB1.bin" exists in the zip
        if (zip.file("FlamingoB1.bin")) {
          // Get the content of "FlamingoB1.bin"
          return zip.file("FlamingoB1.bin").async('uint8array');
        }
        // Check if "Flamingo-Firmware.bin" exists in the zip
        else if (zip.file("Flamingo-Firmware.bin")) {
          // Get the content of "Flamingo-Firmware.bin"
          return zip.file("Flamingo-Firmware.bin").async('uint8array');
        } else {
          // Neither "FlamingoB1.bin" nor "Flamingo-Firmware.bin" exists in the zip
          console.log("Firmware not found in the ZIP file.");
          reject(new Error("Firmware not found in the ZIP file."));
        }
      })
      .then(function (fileData) {
        // If "FlamingoB1.bin" exists, run MyFunction1; if "file2.bin" exists, run MyFunction2
        if (zip.file("FlamingoB1.bin")) {
          resolve({ fileData, functionName: 'OTA_v2_Update' });
        } else if (zip.file("Flamingo-Firmware.bin")) {
          resolve({ fileData, functionName: 'OTA_Update' });
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });
}
//------------------------------------STM32 update routine END---------------------------------------------


    async performUpdate(buffer){

    try {
      // start the process
      var lengthAsBytes = buffer.length;

      try {
        console.log('Setting Characteristic User Description...');
        await this._writeCharacteristicValue(BeginUUID,new Uint32Array([lengthAsBytes]));

        var outputString = "Successfully wrote OTA Begin";
        document.getElementById('output').textContent = outputString;
        console.log(outputString);

      } catch(error) {
        var outputString = "FAILED: OTA did not start"  + error;
        document.getElementById('output').textContent = outputString;
        console.log(outputString);
      }



      // read it back
      var readResult = await this._readCharacteristicValue(BeginUUID);
      var res = new Uint32Array(readResult.buffer)[0]
      console.log(readResult)
      console.log(res)
      if (res == OTA_BEGIN)
      {
          var outputString = "Entered OTA Begin successfully";
          document.getElementById('output').textContent = outputString;
          console.log(outputString);
      }
      else
      {
          var outputString = "FAILED: OTA failed to read or nvalid OTA state {state}" + readResult;
          document.getElementById('output').textContent = outputString;
          console.log(outputString);
          return false;
      }

      var bytesSent = 0;
      var interval = 1;
      var maxWrite = 250;
      var startTime = Date.now();
      while (bytesSent < buffer.length)
      {
          // extract a subbuffer of, at most, 20 bytes to send
          var bytesToSend = Math.min(maxWrite , buffer.length - bytesSent);
          try
          {
              await this._writeCharacteristicValue(DataUUID, buffer.subarray(bytesSent, bytesSent + bytesToSend));

              // result = await _otaDataChar.WriteValueAsync( buffer.AsBuffer( bytesSent, bytesToSend ) );
              if(bytesSent < maxWrite){
                var mins = (Date.now() - startTime)/1000.0 / 60.0;

                var outputString = sprintf("Done! - %i bytes sent in %7.2f mins" ,bytesSent, mins);
                document.getElementById('output').textContent = outputString;
                console.log(outputString);
              }
          }
          catch (ex)
          {
              if (bytesToSend <= maxWrite )
              {
                  bytesSent += bytesToSend;
                  var mins = (Date.now() - startTime)/1000.0 / 60.0;
                  // the last call will abort because the system will restart
                  // need to start the reconnect process
                  // FlashProgressChanged?.Invoke( null, new FlashProgressEventArgs( ) { Progress = $"Done - {bytesSent} bytes sent in {mins:F2} mins" } );
                  var outputString = sprintf("Done!! - %i bytes sent in %7.2f mins" ,bytesSent, mins);

                  document.getElementById('output').textContent = outputString;
                  console.log(outputString);
                  return true;
              }else{
                console.log("FAILED: to send OTA data" );
                return false;
              }
          }

          bytesSent += bytesToSend;
          if ((interval++ % 2) == 0)
          {
              var percentComplete = bytesSent*100 / buffer.length;
              var bytesRemaining = buffer.length - bytesSent;
              var secsPassed = (Date.now() - startTime)/1000.0;
              var bytesPerSecond = bytesSent / secsPassed;
              var minsRemaining = bytesRemaining / bytesPerSecond / 60.0;
              // FlashProgressChanged?.Invoke( null, new FlashProgressEventArgs( ) { Progress=$"{percentComplete}% sent - {bytesRemaining} bytes remaining, {minsRemaining:F2} mins remaining" } );
              
              var outputString = sprintf("%%%i sent, %3.2f mins remaining" ,percentComplete, minsRemaining);
              
              document.getElementById('output').textContent = outputString;
              // console.log(outputString);
          }
      }
      
      // finished sending data

  }
  catch (ex)
  {
    var outputString = "Flash exception" + ex ;
    document.getElementById('output').textContent = outputString;
    console.log(outputString);
  }
  return false;

  }

}

  window.FlamingoBle = new FlamingoBle();

})();
