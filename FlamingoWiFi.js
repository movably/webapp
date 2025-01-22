const esp32IP = "http://192.168.64.189"; // Replace with your ESP32's IP address

const FlamingoWiFi = {
    /**
     * Utility function to send POST requests to the ESP32.
     *
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {number} value - The unsigned integer value to send.
     */
    sendRequest: async function (endpoint, value) {

        console.log(`Sending ${value} to ${endpoint}`);

        try {
            const response = await fetch(`${esp32IP}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: value.toString()
            });

            if (response.ok) {
                const responseText = await response.text();
                console.log(`${endpoint} Response:`, responseText);
            } else {
                console.error(`Failed request to ${endpoint}. Status:`, response.status);
            }
        } catch (error) {
            console.error(`Error sending request to ${endpoint}:`, error);
        }
    },

    /**
     * Utility function to send GET requests to the ESP32.
     *
     * @param {string} endpoint - The endpoint to fetch the value from.
     * @returns {Promise<string|null>} - The response text or null on error.
     */
    getRequest: async function (endpoint) {
        console.log(`Fetching value from ${endpoint}`);

        try {
            const response = await fetch(`${esp32IP}${endpoint}`, {
                method: "GET",
                headers: {
                    "Content-Type": "text/plain"
                }
            });

            if (response.ok) {
                const responseText = await response.text();
                console.log(`${endpoint} Response:`, responseText);
                return responseText;
            } else {
                console.error(`Failed to fetch from ${endpoint}. Status:`, response.status);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error);
            return null;
        }
    },

    /**
     * Toggles the state of a specified side.
     * 
     * @param {number} value - The unsigned integer to toggle.
     */
    setToggle: async function (value) {
        await this.sendRequest("/set_toggle", value);
    },

    /**
     * Sets the auto mode selector.
     * 
     * @param {number} value - The unsigned integer to set.
     */
    setAutoModeSelector: async function (value) {
        await this.sendRequest("/automode_selector", value);
    },

    /**
     * Sets the auto period.
     * 
     * @param {number} value - The unsigned integer to set.
     */
    setAutoPeriod: async function (value) {
        await this.sendRequest("/auto_period", value * 60);
    },

    /**
     * Reads the current auto period value from the ESP32.
     *
     * @returns {Promise<number|null>} - The auto period value or null on error.
     */
    getAutoPeriod: async function () {
        const response = await this.getRequest("/auto_period");
        if (response !== null) {
            const value = parseInt(response, 10);
            if (!isNaN(value)) {
                console.log("Auto Period Value:", value);
                return value/60.0;
            } else {
                console.error("Invalid response received for auto period:", response);
                return null;
            }
        }
        return null;
    },

    /**
     * Reads the current auto period value from the ESP32.
     *
     * @returns {Promise<number|null>} - The auto period value or null on error.
     */
    getAutoModeSelector: async function () {
        const response = await this.getRequest("/automode_selector");
        if (response !== null) {
            const value = parseInt(response, 10);
            if (!isNaN(value)) {
                console.log("Auto mode Value:", value);
                return value;
            } else {
                console.error("Invalid response received for auto mode:", response);
                return null;
            }
        }
        return null;
    },

    /**
     * Reads the current auto period value from the ESP32.
     *
     * @returns {Promise<number|null>} - The auto period value or null on error.
     */
    getAutoMode: async function () {
        const response = await this.getRequest("/automode_cfg");
        if (response !== null) {
            const value = parseInt(response, 10);
            if (!isNaN(value)) {
                console.log("Auto CFG Value:", value);
                return value;
            } else {
                console.error("Invalid response received for auto mode:", response);
                return null;
            }
        }
        return null;
    },

    /**
     * Sets the auto mode selector.
     * 
     * @param {number} value - The unsigned integer to set.
     */
    setAutoMode: async function (value) {
        await this.sendRequest("/automode_cfg", value);
    },

    /**
     * Reads the current auto period value from the ESP32.
     *
     * @returns {Promise<number|null>} - The auto period value or null on error.
     */
    getVibroLevel: async function () {
        const response = await this.getRequest("/vibro_volume");
        if (response !== null) {
            const value = parseInt(response, 10);
            if (!isNaN(value)) {
                console.log("Auto CFG Value:", value);
                return value;
            } else {
                console.error("Invalid response received for auto mode:", response);
                return null;
            }
        }
        return null;
    },

    /**
     * Reads the current auto period values (3 uint8 parameters) from the ESP32.
     *
     * @returns {Promise<number[]|null>} - An array of three auto period values or null on error.
     */
    getChairUpdates: async function () {
        const response = await this.getRequest("/update");
        if (response !== null) {
            const values = response.split(";").map((value) => parseInt(value, 10));
            if (values.length === 3 && values.every((v) => !isNaN(v) && v >= 0 && v <= 255)) {
                console.log("Updates:", values);
                return values;
            } else {
                console.error("Invalid response received for auto mode:", response);
                return null;
            }
        }
        return null;
    },

    /**
     * Sets the auto mode selector.
     * 
     * @param {number} value - The unsigned integer to set.
     */
    setVibroLevel: async function (value) {
        await this.sendRequest("/vibro_volume", value);
    },
};
