class Slider {
  constructor(sliderId, sliderTitleId, sliderTextId) {
    this.slider = document.getElementById(sliderId);
    this.sliderTextElement = document.getElementById(sliderTextId);
    this.sliderTitleElement = document.getElementById(sliderTitleId);
    this.writeFunction = null;
    this.readFunction = null;

    this.handleRead = this.handleRead.bind(this);
    this.oninput = this.oninput.bind(this);
    this.onchange = this.onchange.bind(this);
    this.unit = ""
  }

  setProperties(str, min, max,unit){
    this.sliderTitleElement.textContent = str; 
    this.slider.min = min; 
    this.slider.max = max; 
    this.unit = unit
  }

  registerChanges(writeFunction, readFunction, bleObject){
    this.writeFunction = writeFunction.bind(bleObject);
    this.readFunction = readFunction.bind(bleObject);

    this.slider.onchange = this.onchange;
      
    this.slider.oninput = this.oninput;
  }

  oninput(){
    let val = this.slider.value;
    this.sliderTextElement.textContent = val + " " + this.unit
  }

  onchange(){
    const writtenValue = Number(this.slider.value);
    this.sliderTextElement.textContent = writtenValue + " " + this.unit;
    const writeResult = this.writeFunction(writtenValue);
    if (!writeResult || typeof writeResult.then !== 'function') return;
    writeResult
      .then(() => new Promise(resolve => setTimeout(resolve, 300)))
      .then(() => this.readFunction())
      .then((readValue) => {
        if (Math.round(readValue) === Math.round(writtenValue)) {
          this.sliderTextElement.textContent = readValue + " " + this.unit + " " + String.fromCharCode(10004);
          this.slider.value = readValue;
        } else {
          this.sliderTextElement.textContent = readValue + " " + this.unit;
          this.slider.value = readValue;
        }
      })
      .catch(() => {});
  }
  
  handleRead(value){
    let minutesValue = value;
    minutesValue = minutesValue.toFixed(1);
    this.sliderTextElement.textContent = minutesValue + " " + this.unit + " " + String.fromCharCode(10004);
    this.slider.value = minutesValue;
  }
  
}