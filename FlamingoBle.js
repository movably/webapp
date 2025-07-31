(function() {
  'use strict';

  let encoder = new TextEncoder('utf-8');
  let decoder = new TextDecoder('utf-8');

  const DISCOVERY_SERVICE_UUID = 0x180A

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

  const REALTIME_UUID = "1b25ee05-dadf-11eb-8d19-0242ac130003";
  const ERRORCODES_UUID = "1b25ee06-dadf-11eb-8d19-0242ac130003";
  const ERRORCODES_SPI_UUID = "1b25ee0f-dadf-11eb-8d19-0242ac130003";
  const CHAIR_CONFIGURED_FLAG_UUID = "1b25ee10-dadf-11eb-8d19-0242ac130003";
  const MOS_CLOCK_UPDATE_TIMEOUT_UUID = "1b25ee13-dadf-11eb-8d19-0242ac130003";
  const LEFT_SEAT_MOTOR_SOUND_UUID =  "1b25ee0d-dadf-11eb-8d19-0242ac130003";
  const RIGHT_SEAT_MOTOR_SOUND_UUID = "1b25ee0e-dadf-11eb-8d19-0242ac130003";

  const LEFT_LOCK_MOTOR_DUTY_UUID =  "1b25ee11-dadf-11eb-8d19-0242ac130003";
  const RIGHT_LOCK_MOTOR_DUTY_UUID =  "1b25ee12-dadf-11eb-8d19-0242ac130003";



  const LEFT_LEG_MOVE_CNT_UUID =  "1b25ee1c-dadf-11eb-8d19-0242ac130003";
  const RIGHT_LEG_MOVE_CNT_UUID = "1b25ee1d-dadf-11eb-8d19-0242ac130003";


  const TZInfoFieldUUID         = "1b25ee14-dadf-11eb-8d19-0242ac130003";

  const CONFIGURATION_SERVICE_UUID = "7f1a0001-252d-4f8b-baea-6bfc6b255ab6";


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

    async scanForDevice(onDisconnect){
      this.device_found = false;
      
      try {
        // Use the standard requestDevice method which is widely supported
        // This will prompt the user to select a device
        const device = await navigator.bluetooth.requestDevice({
          filters: [
            { namePrefix: 'Flamingo' },
            { namePrefix: 'Movably Chair' }
          ],
          optionalServices: [
            CHAIR_SERVICE_UUID, 
            DISCOVERY_SERVICE_UUID, 
            ENGINEERING_SERVICE_UUID,
            WiFiserviceUUID,
            TIME_SERVICE_UUID,
            CONFIGURATION_SERVICE_UUID,
            OTAServiceUUID
          ]
        });
        
        console.log('Device selected:', device.name);
        this.device = device;
        this.device_found = true;
        
        // Add disconnect event listener if provided
        if (onDisconnect) {
          this.device.addEventListener('gattserverdisconnected', onDisconnect);
        }
        
        return device;
      } catch (error) {
        console.error('Error scanning for device:', error);
        return null;
      }
    }
    
    async connect(engineering_enabled) {
      console.log("connect()");
      
      // If we don't have a device yet, try to scan for one
      if (!this.device) {
        this.device = await this.scanForDevice();
        if (!this.device) {
          return Promise.reject('No device selected.');
        }
      }
      
      try {
        // Check if we're already connected
        if (this.server && this.device.gatt.connected) {
          console.log("Already connected to GATT server");
          return this.server;
        }
        
        console.log("Connecting to GATT server...");
        const server = await this.device.gatt.connect();

        this.server = server;
        
        try {
          console.log("Getting CHAIR_SERVICE_UUID...");
          let service = await server.getPrimaryService(CHAIR_SERVICE_UUID);
          
          console.log("Caching CHAIR service characteristics...");
          await this._cacheCharacteristic(service, AUTO_MODE_UUID);
          await this._cacheCharacteristic(service, AUTO_PERIOD_UUID);
          await this._cacheCharacteristic(service, CHAIR_STATE_EVENT_UUID);
          await this._cacheCharacteristic(service, CHAIR_TOGGLE_UUID);
          await this._cacheCharacteristic(service, SEND_EVENTS_UUID);
          await this._cacheCharacteristic(service, EVENT_ACK_UUID);
          await this._cacheCharacteristic(service, CHAIR_STATE_UUID);
          await this._cacheCharacteristic(service, AUTO_MODE_SELECTOR_UUID);
          await this._cacheCharacteristic(service, TIME_TO_NEXT_TRANSITION_UUID);
          
          try {
            console.log("Getting DISCOVERY_SERVICE_UUID...");
            service = await server.getPrimaryService(DISCOVERY_SERVICE_UUID);
            
            console.log("Caching DISCOVERY service characteristics...");
            await this._cacheCharacteristic(service, FIRMWARE_REVISION_UUID);
            await this._cacheCharacteristic(service, SOFTWARE_REVISION_UUID);
          } catch (error) {
            console.warn("Error accessing DISCOVERY service:", error);
          }
          
          try {
            console.log("Getting CONFIGURATION_SERVICE_UUID...");
            service = await server.getPrimaryService(CONFIGURATION_SERVICE_UUID);
            
            console.log("Caching CONFIGURATION service characteristics...");
            await this._cacheCharacteristic(service, USER_NAME_UUID);
            await this._cacheCharacteristic(service, SERIAL_NUMBER_UUID);
          } catch (error) {
            console.warn("Error accessing CONFIGURATION service:", error);
          }
          
          try {
            console.log("Getting ENGINEERING_SERVICE_UUID...");
            service = await server.getPrimaryService(ENGINEERING_SERVICE_UUID);
            
            console.log("Caching ENGINEERING service characteristics...");
            await this._cacheCharacteristic(service, REALTIME_UUID);
            await this._cacheCharacteristic(service, ERRORCODES_UUID);
            await this._cacheCharacteristic(service, ERRORCODES_SPI_UUID);
            await this._cacheCharacteristic(service, CHAIR_CONFIGURED_FLAG_UUID);
            await this._cacheCharacteristic(service, MOS_CLOCK_UPDATE_TIMEOUT_UUID);
            await this._cacheCharacteristic(service, LEFT_SEAT_MOTOR_SOUND_UUID);
            await this._cacheCharacteristic(service, RIGHT_SEAT_MOTOR_SOUND_UUID);
            await this._cacheCharacteristic(service, LEFT_LOCK_MOTOR_DUTY_UUID);
            await this._cacheCharacteristic(service, RIGHT_LOCK_MOTOR_DUTY_UUID);
            await this._cacheCharacteristic(service, TZInfoFieldUUID);
            await this._cacheCharacteristic(service, LEFT_LEG_MOVE_CNT_UUID);
            await this._cacheCharacteristic(service, RIGHT_LEG_MOVE_CNT_UUID);
          } catch (error) {
            console.warn("Error accessing ENGINEERING service:", error);
          }
          
          try {
            console.log("Getting WiFiserviceUUID...");
            service = await server.getPrimaryService(WiFiserviceUUID);
            
            console.log("Caching WiFi service characteristics...");
            await this._cacheCharacteristic(service, WiFienableWifiUUID);
            await this._cacheCharacteristic(service, WiFissidUUID);
            await this._cacheCharacteristic(service, WiFipasswordUUID);
            await this._cacheCharacteristic(service, WiFistatusUUID);
            await this._cacheCharacteristic(service, WiFicommandUUID);
          } catch (error) {
            console.warn("Error accessing WiFi service:", error);
          }
          
          try {
            console.log("Getting TIME_SERVICE_UUID...");
            service = await server.getPrimaryService(TIME_SERVICE_UUID);
            
            console.log("Caching TIME service characteristics...");
            await this._cacheCharacteristic(service, CURRENT_TIME_UUID);
          } catch (error) {
            console.warn("Error accessing TIME service:", error);
          }
          
          try {
            console.log("Getting OTAServiceUUID...");
            service = await server.getPrimaryService(OTAServiceUUID);
            
            console.log("Caching OTA service characteristics...");
            await this._cacheCharacteristic(service, BeginUUID);
            await this._cacheCharacteristic(service, DataUUID);
            await this._cacheCharacteristic(service, Begin_OTA_v2_UUID);
            await this._cacheCharacteristic(service, Data_OTA_v2_UUID);
            await this._cacheCharacteristic(service, Status_OTA_v2_UUID);
          } catch (error) {
            console.warn("Error accessing OTA service:", error);
          }
          
          console.log("Connection and service discovery completed successfully");
          return server;
        } catch (error) {
          console.error("Error during service discovery:", error);
          throw error;
        }
      } catch (error) {
        console.error("Error connecting to device:", error);
        throw error;
      }

      
             
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

    async getTimeToNextTransition(){
      try {
        // console.log("reading time to next transition")
        const response = await this._readCharacteristicValue(TIME_TO_NEXT_TRANSITION_UUID);
        return this.handleFloatReading(response);
      } catch (error) {
        console.warn("Error getting time to next transition:", error);
        return 0; // Return a default value
      }
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

    async getWiFiStatusCodes(){
      try {
        return await this._readCharacteristicValue(WiFistatusUUID);
      } catch (error) {
        // This characteristic might cause "GATT operation not permitted" errors
        // Only log this once per session to reduce console spam
        if (!this._wifiStatusErrorLogged) {
          console.warn("Error reading WiFi status codes, this is expected on some devices:", error);
          this._wifiStatusErrorLogged = true;
        }
        return null; // Return null on error
      }
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

    async getWiFiEnableStatus(){
      try {
        const response = await this._readCharacteristicValue(WiFienableWifiUUID);
        if (!response) return 0; // Return 0 (disabled) if no response
        return this._decodeUint8(response);
      } catch (error) {
        // This characteristic might cause "GATT operation not permitted" errors
        // Only log this once per session to reduce console spam
        if (!this._wifiEnableErrorLogged) {
          console.warn("Error reading WiFi enable status, this is expected on some devices:", error);
          this._wifiEnableErrorLogged = true;
        }
        return 0; // Return 0 (disabled) on error
      }
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
      // Check if data is null or undefined
      if (!data) {
        // Only log this once per minute to reduce console spam
        const now = Date.now();
        if (!this._lastFloatReadingErrorLog || now - this._lastFloatReadingErrorLog > 60000) {
          console.warn("handleFloatReading received null or undefined data");
          this._lastFloatReadingErrorLog = now;
        }
        return 0; // Return a default value
      }
      
      try {
        // Check if data has a buffer property
        if (!data.buffer) {
          return 0; // Return a default value if no buffer
        }
        
        // console.log(data)
        let val = new Float32Array(data.buffer)[0];
        
        // Check if the value is a valid number
        if (isNaN(val) || !isFinite(val)) {
          return 0; // Return a default value if not a valid number
        }
        
        // console.log(val)
        return val;
      } catch (error) {
        // Only log this once per minute to reduce console spam
        const now = Date.now();
        if (!this._lastFloatReadingErrorLog || now - this._lastFloatReadingErrorLog > 60000) {
          console.error("Error in handleFloatReading:", error);
          this._lastFloatReadingErrorLog = now;
        }
        return 0; // Return a default value
      }
    }

    handleUint32Reading(data){
      // console.log(data)
      let val = new Uint32Array(data.buffer)[0]
      // console.log(val)
      return val;
    }









    setChairConfiguredFlag(enable) {
      return this._writeCharacteristicValue(CHAIR_CONFIGURED_FLAG_UUID, new Uint8Array([enable]))
    }

    getChairConfiguredFlag(){
      return this._readCharacteristicValue(CHAIR_CONFIGURED_FLAG_UUID).then((response) => this._decodeUint8(response))  
    }





    getclockUpdateValue(){
      return this._readCharacteristicValue(MOS_CLOCK_UPDATE_TIMEOUT_UUID).then((response) => this.handleUint32Reading(response))  
    }

    setClockUpdateValue(value) {
      return this._writeCharacteristicValue(MOS_CLOCK_UPDATE_TIMEOUT_UUID, new Uint32Array([value]))
    }

    setLeftLegMotorLockStrength(strength){
      return this._writeCharacteristicValue(LEFT_LOCK_MOTOR_DUTY_UUID, new Float32Array([strength/1000]))
    }

    getLeftLegMotorLockStrength() {
      return this._readCharacteristicValue(LEFT_LOCK_MOTOR_DUTY_UUID).then((response) => this.handleFloatReading(response) * 1000);  
    }
    
    setRightLegMotorLockStrength(strength){
      return this._writeCharacteristicValue(RIGHT_LOCK_MOTOR_DUTY_UUID, new Float32Array([strength/1000]))
    }

    getRightLegMotorLockStrength() {
      return this._readCharacteristicValue(RIGHT_LOCK_MOTOR_DUTY_UUID).then((response) => this.handleFloatReading(response) * 1000);  
    }

    getLeftLegOdometer() {
      // Check if characteristic is cached
      let characteristic = this._characteristics.get(LEFT_LEG_MOVE_CNT_UUID);
      if (!characteristic) {
        console.error("Left leg odometer characteristic not found in cache");
        return Promise.reject(new Error("Characteristic not cached"));
      }
      
      return this._readCharacteristicValue(LEFT_LEG_MOVE_CNT_UUID).then((response) => {
        const value = this.handleUint32Reading(response);
        return value;
      }).catch(error => {
        console.error("Error reading left leg odometer:", error);
        throw error;
      });  
    }

    getRightLegOdometer() {
      // Check if characteristic is cached
      let characteristic = this._characteristics.get(RIGHT_LEG_MOVE_CNT_UUID);
      if (!characteristic) {
        console.error("Right leg odometer characteristic not found in cache");
        return Promise.reject(new Error("Characteristic not cached"));
      }
      
      return this._readCharacteristicValue(RIGHT_LEG_MOVE_CNT_UUID).then((response) => {
        const value = this.handleUint32Reading(response);
        return value;
      }).catch(error => {
        console.error("Error reading right leg odometer:", error);
        throw error;
      });  
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


    /* Discovery Service */



    getEmailString(){
      return this._readCharacteristicValue(USER_NAME_UUID).then((response) => this._decodeString(response))  
    }

    setEmailString(str){
      return this._writeCharacteristicValue(USER_NAME_UUID,this._encodeString(str))
    }

    getSerialNumber(){
      return this._readCharacteristicValue(SERIAL_NUMBER_UUID).then((response) => this._decodeString(response))  
    }

    async getWiFiSSIDString(){
      try {
        const response = await this._readCharacteristicValue(WiFissidUUID);
        if (!response) return ""; // Return empty string if no response
        return this._decodeString(response);
      } catch (error) {
        // This characteristic might cause "GATT operation not permitted" errors
        // Only log this once per session to reduce console spam
        if (!this._wifiSsidErrorLogged) {
          console.warn("Error reading WiFi SSID, this is expected on some devices:", error);
          this._wifiSsidErrorLogged = true;
        }
        return ""; // Return empty string on error
      }
    }

    setWiFiSSIDString(str){
      return this._writeCharacteristicValue(WiFissidUUID,this._encodeString(str))
    }

    async getTZInfoDeviceString(){
      try {
        const response = await this._readCharacteristicValue(TZInfoFieldUUID);
        if (!response) return ""; // Return empty string if no response
        return this._decodeString(response);
      } catch (error) {
        // This characteristic might cause "GATT operation not permitted" errors
        // Only log this once per session to reduce console spam
        if (!this._tzInfoErrorLogged) {
          console.warn("Error reading timezone info, this is expected on some devices:", error);
          this._tzInfoErrorLogged = true;
        }
        return ""; // Return empty string on error
      }
    }

    setTZInfoDeviceString(str){
      return this._writeCharacteristicValue(TZInfoFieldUUID,this._encodeString(str))
    }

    // WiFi password should only be written to, not read from
    // This method is kept for compatibility but always returns an empty string
    async getWiFiPWDString(){
      console.log("Note: WiFi password is write-only, returning empty string");
      return ""; // Always return empty string
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
      console.log(str)
      return this._writeCharacteristicValue(SERIAL_NUMBER_UUID,this._encodeString(str))  
    }
    /* Battery Service */

    getBatteryLevel() {
      return this._readCharacteristicValue('battery_level')
      .then(data => data.getUint8(0));
    }

    /* Utils */

    async _cacheCharacteristic(service, characteristicUuid) {
      try {
        // Try to get the characteristic
        let characteristic = await service.getCharacteristics(characteristicUuid);
        
        // Check if we got a valid characteristic
        if (characteristic && characteristic.length > 0) {
          this._characteristics.set(characteristicUuid, characteristic[0]);
          return characteristic[0];
        } else {
          console.warn(`Characteristic ${characteristicUuid} not found`);
          return null;
        }
      } catch(error) {
        console.warn(`Error caching characteristic ${characteristicUuid}:`, error);
        return null;
      }
    }
    async _readCharacteristicValue(characteristicUuid) {
      try {
        let characteristic = this._characteristics.get(characteristicUuid);
        
        if (!characteristic) {
          // Only log this once per minute for each characteristic to reduce console spam
          const now = Date.now();
          const errorKey = `read_${characteristicUuid}`;
          if (!this._lastCharacteristicErrors || !this._lastCharacteristicErrors[errorKey] || 
              now - this._lastCharacteristicErrors[errorKey] > 60000) {
            console.warn(`Characteristic ${characteristicUuid} not found in cache`);
            if (!this._lastCharacteristicErrors) this._lastCharacteristicErrors = {};
            this._lastCharacteristicErrors[errorKey] = now;
          }
          return null;
        }
        
        // Use a timeout to prevent hanging if the operation takes too long
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        // Race the timeout against the actual operation
        const value = await Promise.race([
          characteristic.readValue(),
          timeoutPromise
        ]);
        
        return value;
      } catch (error) {
        // Only log this once per minute for each characteristic to reduce console spam
        const now = Date.now();
        const errorKey = `read_error_${characteristicUuid}`;
        if (!this._lastCharacteristicErrors || !this._lastCharacteristicErrors[errorKey] || 
            now - this._lastCharacteristicErrors[errorKey] > 60000) {
          // Don't log timeout errors (to reduce console spam)
          if (error.message !== 'Timeout') {
            console.error(`Error reading characteristic ${characteristicUuid}:`, error);
          }
          if (!this._lastCharacteristicErrors) this._lastCharacteristicErrors = {};
          this._lastCharacteristicErrors[errorKey] = now;
        }
        throw error;
      }
    }

    async _writeCharacteristicValue(characteristicUuid, value) {
      try {
        let characteristic = this._characteristics.get(characteristicUuid);
        
        if (!characteristic) {
          // Only log this once per minute for each characteristic to reduce console spam
          const now = Date.now();
          const errorKey = `write_${characteristicUuid}`;
          if (!this._lastCharacteristicErrors || !this._lastCharacteristicErrors[errorKey] || 
              now - this._lastCharacteristicErrors[errorKey] > 60000) {
            console.warn(`Characteristic ${characteristicUuid} not found in cache for writing`);
            if (!this._lastCharacteristicErrors) this._lastCharacteristicErrors = {};
            this._lastCharacteristicErrors[errorKey] = now;
          }
          return null;
        }
        
        // Use a timeout to prevent hanging if the operation takes too long
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        // Race the timeout against the actual operation
        //console.debug('WRITE', characteristic.uuid, value);
        return await Promise.race([
          characteristic.writeValue(value),
          timeoutPromise
        ]);
      } catch (error) {
        // Only log this once per minute for each characteristic to reduce console spam
        const now = Date.now();
        const errorKey = `write_error_${characteristicUuid}`;
        if (!this._lastCharacteristicErrors || !this._lastCharacteristicErrors[errorKey] || 
            now - this._lastCharacteristicErrors[errorKey] > 60000) {
          // Don't log timeout errors (to reduce console spam)
          if (error.message !== 'Timeout') {
            console.error(`Error writing to characteristic ${characteristicUuid}:`, error);
          }
          if (!this._lastCharacteristicErrors) this._lastCharacteristicErrors = {};
          this._lastCharacteristicErrors[errorKey] = now;
        }
        throw error;
      }
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
