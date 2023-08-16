(function() {
  'use strict';

  let encoder = new TextEncoder('utf-8');
  let decoder = new TextDecoder('utf-8');

  /* Custom Bluetooth Service UUIDs */

  const CANDLE_SERVICE_UUID = "730c0001-7ec9-4dd5-ba24-44a04e14cf08";

  /* Custom Bluetooth Characteristic UUIDs */

  const CANDLE_DEVICE_NAME_UUID = 0xFFFF;
  const CANDLE_COLOR_UUID = 0xFFFC;
  const CANDLE_EFFECT_UUID = 0xFFFB;
  const CANDLE_BLOW_NOTIFICATIONS_UUID = 0x2A37;

  const CHAIR_SERVICE_UUID = "730c0001-7ec9-4dd5-ba24-44a04e14cf08";

  const AUTO_MODE_UUID = "730c0003-7ec9-4dd5-ba24-44a04e14cf08";
  const AUTO_PERIOD_UUID = "730c0002-7ec9-4dd5-ba24-44a04e14cf08";
  const CHAIR_STATE_EVENT_UUID = "730c0005-7ec9-4dd5-ba24-44a04e14cf08";
  const CHAIR_TOGGLE_UUID = "730c0006-7ec9-4dd5-ba24-44a04e14cf08";
  const SEND_EVENTS_UUID = "730c0007-7ec9-4dd5-ba24-44a04e14cf08";
  const EVENT_ACK_UUID = "730c0008-7ec9-4dd5-ba24-44a04e14cf08";
  const CHAIR_STATE_UUID = "730c0009-7ec9-4dd5-ba24-44a04e14cf08";

  const ENGINEERING_SERVICE_UUID = "1b25ee00-dadf-11eb-8d19-0242ac130003";

  const VEL_UUID = "1b25ee01-dadf-11eb-8d19-0242ac130003";
  const ACCEL_UUID = "1b25ee02-dadf-11eb-8d19-0242ac130003";
  const DECCEL_UUID = "1b25ee03-dadf-11eb-8d19-0242ac130003";
  const TRAJ_VEL_UUID = "1b25ee04-dadf-11eb-8d19-0242ac130003";
  const REALTIME_UUID = "1b25ee05-dadf-11eb-8d19-0242ac130003";
  const ERRORCODES_UUID = "1b25ee06-dadf-11eb-8d19-0242ac130003";
  const TRIGGER_BY_MOTION_UUID = "1b25ee07-dadf-11eb-8d19-0242ac130003";
  const STREAMING_ENABLE_UUID = "1b25ee08-dadf-11eb-8d19-0242ac130003";
  const BASE_AWAY_LOWER_THRESHOLD_UUID = "1b25ee09-dadf-11eb-8d19-0242ac130003";
  const BASE_AWAY_UPPER_THRESHOLD_UUID = "1b25ee0a-dadf-11eb-8d19-0242ac130003";

  const CONFIGURATION_SERVICE_UUID = "7f1a0001-252d-4f8b-baea-6bfc6b255ab6";

  const MODEL_NUMBER_UUID = "7f1a0002-252d-4f8b-baea-6bfc6b255ab6";
  const SERIAL_NUMBER_UUID = "7f1a0003-252d-4f8b-baea-6bfc6b255ab6";
  const USERNAME_UUID = "7f1a0004-252d-4f8b-baea-6bfc6b255ab6";

  const OTAServiceUUID = "d0274711-aefa-42c3-93f1-535a09812c37";
  const BeginUUID = "403b76d9-9bc6-4837-8112-cd62516ef214";
  const DataUUID = "d0270001-aefa-42c3-93f1-535a09812c37";
  const OTA_INIT = 0;
  const OTA_BEGIN = 1;
  const OTA_INPROGRESS = 2;
  const OTA_SUCCESS = 3;


  const TIME_SERVICE_UUID = 0x1805;
  const CURRENT_TIME_UUID = 0x2A2B;

  /* Wifi service */
  const WifiServiceUUID = "73e80001-24f7-464d-8de7-3b1e1bfb5dfa";
  const EnableWifiUUID = "73e80002-24f7-464d-8de7-3b1e1bfb5dfa";
  const WifiSsidUUID = "73e80003-24f7-464d-8de7-3b1e1bfb5dfa";
  const WifiPasswordUUID = "73e80004-24f7-464d-8de7-3b1e1bfb5dfa";
  const WifiStatusUUID = "73e80005-24f7-464d-8de7-3b1e1bfb5dfa";
  const WifiCommandUUID = "73e80006-24f7-464d-8de7-3b1e1bfb5dfa";
  /* status values */
  const WIFI_DISABLED = 0;
  const WIFI_NOT_CONFIGURED = 1;
  const WIFI_ERROR_CONNECTING = 2;
  const WIFI_CONNECTED = 3;
  const WIFI_DISCONNECTED = 4;
  const WIFI_WIFI_NOT_FOUND = 5;
  const WIFI_SSID_PW_INVALID = 6;
  /* command values */
  const WIFI_CONNECT_CMD = 1;
  const WIFI_DISCONNECT_CMD = 2;


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

    }
    request(onDisconnect) {
      // let options = {filters:[{services:[ CANDLE_SERVICE_UUID ]}]};

      // let options = {filters:[{services:[ CHAIR_SERVICE_UUID ]}],
      //                optionalServices: ['battery_service']};
      let options = {//acceptAllDevices: true,
                      filters:[{namePrefix: 'Flamingo'}],
                      // filters:[{services:[ CHAIR_SERVICE_UUID ]}],
                      optionalServices: [CHAIR_SERVICE_UUID, ENGINEERING_SERVICE_UUID, CONFIGURATION_SERVICE_UUID, TIME_SERVICE_UUID, OTAServiceUUID, WifiServiceUUID]};
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        this.device.addEventListener('gattserverdisconnected', onDisconnect);

      })
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


      service = await server.getPrimaryService(CONFIGURATION_SERVICE_UUID);

      this._cacheCharacteristic(service, MODEL_NUMBER_UUID);
      this._cacheCharacteristic(service, SERIAL_NUMBER_UUID);
      this._cacheCharacteristic(service, USERNAME_UUID);


      service = await server.getPrimaryService(ENGINEERING_SERVICE_UUID);
      this._cacheCharacteristic(service, VEL_UUID);
      this._cacheCharacteristic(service, ACCEL_UUID);
      this._cacheCharacteristic(service, DECCEL_UUID);
      this._cacheCharacteristic(service, TRAJ_VEL_UUID);
      this._cacheCharacteristic(service, REALTIME_UUID);
      this._cacheCharacteristic(service, ERRORCODES_UUID);
      this._cacheCharacteristic(service, TRIGGER_BY_MOTION_UUID);
      this._cacheCharacteristic(service, STREAMING_ENABLE_UUID);
      this._cacheCharacteristic(service, BASE_AWAY_LOWER_THRESHOLD_UUID);
      this._cacheCharacteristic(service, BASE_AWAY_UPPER_THRESHOLD_UUID);

      service = await server.getPrimaryService(TIME_SERVICE_UUID);
      this._cacheCharacteristic(service, CURRENT_TIME_UUID);


      service = await server.getPrimaryService(OTAServiceUUID);
      this._cacheCharacteristic(service, BeginUUID);
      this._cacheCharacteristic(service, DataUUID);
             
      service = await server.getPrimaryService(WifiServiceUUID);
      if (!service == false)  // will getPrimary return null if service is not available?
      {
        this._cacheCharacteristic(service, EnableWifiUUID);
        this._cacheCharacteristic(service, WifiSsidUUID);
        this._cacheCharacteristic(service, WifiPasswordUUID);
        this._cacheCharacteristic(service, WifiStatusUUID);
        this._cacheCharacteristic(service, WifiCommandUUID);
      }             
    }

    /* -- start wifi service -- */
    getWifiSsid()
    {
      return this._readCharacteristicValue(WifiSsidUUID).then((response) => this._decodeString(response))  
    }
    
    getWifiPassword(){
      return this._readCharacteristicValue(WifiPasswordUUID).then((response) => this._decodeString(response))  
    }

    setWifiSsid(str){
      return this._writeCharacteristicValue(WifiSsidUUID,this._encodeString(str))
    }

    setWifiPasword(str){
      return this._writeCharacteristicValue(WifiPasswordUUID,this._encodeString(str))
    }

    /* will return 0 or 1*/
    getWifiEnable(){
      return this._readCharacteristicValue(EnableWifiUUID).then((response) => this._decodeUint8(response))  
    }
    setWifiEnable(enable)  /* pass in 0 or 1 */
    {
      return this._writeCharacteristicValue(EnableWifiUUID, new Uint8Array([enable]))
    }

    snedWifiCommand(cmd){
      return this._writeCharacteristicValue(WifiCommandUUID, new Uint8Array([cmd]))
    }

    /* -- end wifi service -- */

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
    
    setMode(mode) {
      this._writeCharacteristicValue(AUTO_MODE_UUID, new Uint8Array([mode]))
    }

    setToggle(side) {
      this._writeCharacteristicValue(CHAIR_TOGGLE_UUID, new Uint8Array([side]))
    }
    
    getChairEvent(){
        return this._readCharacteristicValue(CHAIR_STATE_UUID)
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


    /* Discovery Service */

    getModelNumber(){
      return this._readCharacteristicValue(MODEL_NUMBER_UUID).then((response) => this._decodeString(response))  
    }

    getSerialNumber(){
      return this._readCharacteristicValue(SERIAL_NUMBER_UUID).then((response) => this._decodeString(response))  
    }

    getUsername(){
      return this._readCharacteristicValue(USERNAME_UUID).then((response) => this._decodeString(response))  
    }

    setModelNumber(str){
      return this._writeCharacteristicValue(MODEL_NUMBER_UUID,this._encodeString(str))
    }

    setSerialNumber(str){
      return this._writeCharacteristicValue(SERIAL_NUMBER_UUID,this._encodeString(str))  
    }

    setUsername(str){
      return this._writeCharacteristicValue(USERNAME_UUID,this._encodeString(str))  
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
