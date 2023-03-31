import { useState, useEffect } from "react";
import data from "./output.json"
import itemNames from "./ids_and_names.json"
import './App.css';

//import all icon files (magic)
const images = {};
function importAll(r) {
  r.keys().forEach((key) => (images[key] = r(key)));
}
importAll(require.context("../public/icons", false, /\.png$/));


/*
todo:
  back:
[]mejorar el algoritmo de los colores para los items multicolores
  deje notas sobre esto en average_hues.py
[]hay una tonelada de items de colores en Blacks, investigar
  zammy sara dhide defenders mystic robes dark, cosas rojas?

  front:
[X]analizar si es productivo separar con mas granularidad o si quedarian muy poco poblados algunos sets del medio
  it is not, its fine as is
[X]refactorear el return de GearVisualizer para que cada slot esté donde tiene que estar
[X]added black white gray
[X]boton de "lock slot"
 [X] y de "reroll slot" (al final era distinto pero salio xd)
  [X] hacerlos bien facheritos, dan asco ahora
[X]boton de exportar outfit - construir el objeto con formato Fashionscape, dartelo en un code box
  hable un rato con chatgpt de esto, es muy facil ya me lo hizo xdxd
[]incorporarlo a tomexlol.com cuando esté medianamente funcional y bonito, agregar css etc
[X]LIMPIAR ESTE CODIGO QUE ES UN ASCO y COMENTARLO
[]escribir un blogpost desglosando qué hace y cómo para pegar laburo xdxd


*/

//component 1: the form. handles color data and calls onGenerateSet when submitted.
function GeneratorForm({ onGenerateSet }) {
  const [hue, setHue] = useState(30);
  const [twoHands, setTwoHands] = useState(false);
  const [hueString, setHueString] = useState("color");
  

  //colors the Generate Set button based on the selected hue range
    const handleHueChange = (event) => {
    setHue(parseInt(event.target.value));
    const button = document.querySelector('button[type="submit"]');
    button.style.backgroundColor = `hsl(${parseInt(event.target.value) >= 120 ? parseInt(event.target.value) + 100 : parseInt(event.target.value) + 15 }, 100%, 50%)`;
    parseInt(event.target.value) === 150 ? button.style.color = "white" : button.style.color = "black"
  };


  //handles whether (weapon+shield) or (2h) slots are visible whenever value is toggled
  const handleTwoHandsChange = (event) => {
    setTwoHands(event.target.checked);
    const shieldSlot = document.getElementsByClassName('shield')[0];
    const weaponSlot = document.getElementsByClassName('weapon')[0];
    const weaponSlot2h = document.getElementsByClassName('2h')[0];
    if (shieldSlot){
      if (event.target.checked){
        weaponSlot.style.display = "none"
        shieldSlot.style.display = "none"
        weaponSlot2h.style.display = "block"
      } else {
        weaponSlot.style.display = ""
        shieldSlot.style.display = ""
        weaponSlot2h.style.display ="none"
      }
    } 
  };


  //sets the hueString if B/W/G mode is on
  //also changes the style of "Generate Set" button to match Color Mode
  const handleColorModeChange = (event) => {
    const slider = document.getElementsByClassName('color-slider')[0];
    const button = document.querySelector('button[type="submit"]');
    if (event.target.value === "color"){
      slider.style.display = ""
      setHueString(false)
      button.style.backgroundColor = `hsl(${parseInt(hue) >= 120 ? parseInt(hue) + 100 : parseInt(hue) + 15 }, 100%, 50%)`;
      parseInt(hue) === 150 ? button.style.color = "white" : button.style.color = "black"
    } else {slider.style.display = "none"}
    setHueString(event.target.value)
    if (event.target.value === "black") {
      button.style.backgroundColor = "black"
      button.style.color = "white"
    } else if (event.target.value === "white") {
      button.style.backgroundColor = "white"
      button.style.color = "black"
    } else if (event.target.value === "gray") {
      button.style.backgroundColor = "gray"
    }
  }


  //calls generateSet with parameters from form
  const handleSubmit = (event) => {
    event.preventDefault();
    if (hueString !== "color") {onGenerateSet(hueString, twoHands, null)} else {onGenerateSet(hue, twoHands, null)};
  };

  
  return (
    <form id = "gear-form" onSubmit={handleSubmit}>
      <input name ="colorSlider" className="color-slider" type="range" min="30" max="210" step="30" value={hue} onChange={handleHueChange}></input>
      <label><input type="radio" checked={hueString === 'color'} name="color-mode" value="color" onChange={handleColorModeChange}/> Color </label>
      <label><input type="radio" checked={hueString === 'black'} name="color-mode" value="black" onChange={handleColorModeChange}/> Black </label>
      <label><input type="radio" checked={hueString === 'white'} name="color-mode" value="white" onChange={handleColorModeChange}/> White </label>
      <label><input type="radio" checked={hueString === 'gray'} name="color-mode" value="gray" onChange={handleColorModeChange} /> Gray </label>
      <div className="form-input-container">
      <label className="two-hands-checkbox" htmlFor="twoHands">Use 2h weapons</label>
      <input className="two-hands-checkbox"
        type="checkbox"
        id="twoHands"
        name="twoHands"
        checked={twoHands}
        onChange={handleTwoHandsChange}
      />
      </div>


      <button type="submit" style={{ backgroundColor: 'rgb(255, 191, 0)' }}>Generate Set</button>
    </form>
  );
}



//component 2: the gear visualizer. shows the slots and has buttons to manipulate them and export the set.
function GearVisualizer({ gearSet, onLockedSlot, onRerollSlot, onExportSet, lockedSlotsList }) {
  let iconsVisible = "yes"

  //toggles Protect Item + Smite icons in each slot. called by toggle-icons class button.
  const toggleIcons = () => {
    const rerollClass = document.querySelectorAll('.reroll-button')
    const lockClass = document.querySelectorAll('.lock-button')
    const lockBgImage = window.getComputedStyle(lockClass[0]).getPropertyValue('background-image');
    const rerollBgImage = window.getComputedStyle(rerollClass[0]).getPropertyValue('background-image');
    const toggleButtonsButton = document.getElementsByClassName("toggle-icons-button")[0];

    console.log(iconsVisible)
    if (lockBgImage !== "none" && rerollBgImage !== "none") {
    
      for (let i = 0; i < lockClass.length; i++) {
        lockClass[i].style.backgroundImage = 'none';
      } for (let i = 0; i < rerollClass.length; i++) {
        rerollClass[i].style.backgroundImage = 'none';
      }
      toggleButtonsButton.textContent = "Show Buttons";
      toggleButtonsButton.style.backgroundColor = "#b8a282";
       } else {
               for (let i = 0; i < lockClass.length; i++) {
        lockClass[i].style.backgroundImage = '';
      } for (let i = 0; i < rerollClass.length; i++) {
        rerollClass[i].style.backgroundImage = '';
      }
      toggleButtonsButton.textContent = "Hide Buttons";
      toggleButtonsButton.style.backgroundColor = "";
       }
  }

  //toggles the borders of each slot. called by toggle-borders-button class button.
  const toggleBorders = () => {
    const toggleBordersButton = document.getElementsByClassName("toggle-borders-button")[0];
    const gridElements = document.querySelectorAll('.gear-visualizer div');
    const gridElementsBorder = window.getComputedStyle(gridElements[1]).getPropertyValue('border');
    console.log(gridElementsBorder)
    if (gridElementsBorder !== "0px none rgb(0, 0, 0)") {
      for (let i = 0; i < gridElements.length; i++){
        gridElements[i].style.border = "none"
      }
      toggleBordersButton.style.backgroundColor = "#b8a282"
      toggleBordersButton.textContent = "Show Borders";
    } else {
        for (let i = 0; i < gridElements.length; i++){
          gridElements[i].style.border = "1px solid #94866d";
          console.log(gridElements[i].style.border)
        }
      toggleBordersButton.style.backgroundColor = "gray"
      toggleBordersButton.textContent = "Hide Borders"
    }
  }


  //magic follows: for each visible(ingame) slot, grabs the data from gearSet and builds the div for that slot
  const visibleSlots = [
    "head",
    "cape",
    "neck",
    "weapon",
    "shield",
    "2h",
    "body",
    "legs",
    "hands",
    "feet",
  ];
    //we use visibleSlots instead of Object.keys(gearSet) to make both the weapon and the 2h slots regardless of gearSet - otherwise "toggle 2h" gets all fucked
  const slotComponents = visibleSlots.map((slot) => {
    const itemId = gearSet[slot];
    const itemIcon = images[`./${itemId}.png`];
    return (
          <div key={slot} className={lockedSlotsList.includes(slot) ? `locked-${slot}` : slot}>
        <img src={itemIcon} alt={itemId} />
        <br></br>
        {itemNames[gearSet[slot]]}
        <br></br>
        <button data-slot={slot} className="lock-button" type="button" onClick={() => onLockedSlot(slot)}>{lockedSlotsList.includes(slot) ? "" : ""}</button>
        {!lockedSlotsList.includes(slot) ? <button data-slot={slot} className="reroll-button" type="button" onClick={() => onRerollSlot(slot)}></button> : ""}
      </div>
    );
  });

  //map ends. returns stuff. checks if there's a gearSet to return post-buttons-container for post-generation actions
  return (
    <>
    <div className="gear-visualizer">{slotComponents}</div>
    {Object.values(gearSet).length !== 0 ? <><div className="post-buttons-container">
    <button className="toggle-icons-button" type="button" onClick={toggleIcons}>Hide Buttons</button>
    <button className="toggle-borders-button" type="button" onClick={toggleBorders}>Hide Inner Borders</button>
    <button className="export-button" type="button" onClick={() => onExportSet(gearSet)}>Export to FashionScape</button>
    </div>
    </> : ""}
    </>
    )
}


//main parent component
function App() {
  const [gearSet, setGearSet] = useState({});
  const [lockedSlots, setLockedSlots] = useState([]);
  const [exportedSet, setExportedSet] = useState({});

//shows a placeholder (class 'first-run' element) if there's no gearSet. hides it when gearSet appears.
  useEffect(() => {const isFirstRun = document.getElementsByClassName('first-run')[0];
  document.getElementsByClassName('form-input-container')[0].style.display = isFirstRun ? "None" : "inline-block"
}, [gearSet]);


  //handles locking slots (Protect Item). called by .lock-button 's
  const handleLockedSlots = (slot) => {
    if (typeof lockedSlots === "object" && lockedSlots.includes(slot)){
      //remove
      let newLockedSlots = [...lockedSlots]
      console.log(newLockedSlots)
      let filterLockedSlots = newLockedSlots.filter(item => item !== slot);
      setLockedSlots(filterLockedSlots)
    } else if (typeof lockedSlots === "object" && !lockedSlots.includes(slot)) {
      //add
      let newLockedSlots = [...lockedSlots]
      newLockedSlots.push(slot)
      setLockedSlots(newLockedSlots)
      }
    }
  

    //handles rerolls (Smite). called by .reroll-button 's
    //does magic to grab the form data as the form is over in africa and i didn't want to pass 3 states for this xdd
    const handleRerollSlot = (slot) => {
      const formData = new FormData(document.getElementById('gear-form'));
      const colorModeValue = formData.get("color-mode")
      const colorSliderValue = formData.get("colorSlider")
      const twoHandsValue = formData.get("twoHands")
      console.log(colorModeValue)
      console.log(colorSliderValue)
      console.log(twoHandsValue)
      if (colorModeValue === "color") {generateSet(parseInt(colorSliderValue), twoHandsValue, slot)} else {generateSet(colorModeValue, twoHandsValue, slot)};
    }


  //handles set generation, called by button type submit and by handleRerollSlot
  const generateSet = (hueRange, twoHands, rerolledSlot = null) => {
    const visibleSlotsBase = twoHands
      ? ["2h", "body", "cape", "feet", "hands", "head", "legs", "neck"]
      : ["body", "cape", "feet", "hands", "head", "legs", "neck", "shield", "weapon"];

    const newGearSet = {};

    const visibleSlots = visibleSlotsBase.filter((slot) => !lockedSlots.includes(slot));

   
    //if called by handleRerollSlot: new set is old set minus rerolledSlot which is re-generated
    if (rerolledSlot !== null){
      if (typeof hueRange === "number"){
        newGearSet[rerolledSlot] = data[rerolledSlot][`under_${hueRange}`][Math.floor(Math.random() * data[rerolledSlot][`under_${hueRange}`].length)];
       } else if (typeof hueRange === "string"){
        newGearSet[rerolledSlot] = data[rerolledSlot][`${hueRange}`][Math.floor(Math.random() * data[rerolledSlot][`${hueRange}`].length)];
       }
       let notRerollSlots = visibleSlots.filter((item) => item !== rerolledSlot)
       for (const slot of notRerollSlots){
        newGearSet[slot] = gearSet[slot]
       }
       for (const slot of lockedSlots){
        newGearSet[slot] = gearSet[slot]
       }
       setGearSet(newGearSet);
       return "rerolled"
      }

    //if color mode is Color, hueRange = number. data source has "under_{hueRange}" object.
    if (typeof hueRange === "number"){
      for (const slot of visibleSlots) {
       newGearSet[slot] = data[slot][`under_${hueRange}`][Math.floor(Math.random() * data[slot][`under_${hueRange}`].length)];
    }
  } //if color mode is B/W/G, hueRange = string. data source has "{hueRange}" object.
    else if (typeof hueRange === "string"){
      for (const slot of visibleSlots) {
        newGearSet[slot] = data[slot][`${hueRange}`][Math.floor(Math.random() * data[slot][`${hueRange}`].length)];
      }
    }
    for (const slot of lockedSlots){
      newGearSet[slot] = gearSet[slot]
    }
    
    setGearSet(newGearSet);
  };


  //handles set exporting. called by .export-button.
  //formats the data to the FashionScape plugin's format and displays it on screen.
  const handleExportSet = setData => {
    const newExportedSet = {}
    const slotMap = {
      "head": "HEAD",
      "cape": "CAPE",
      "neck": "AMULET",
      "weapon": "WEAPON",
      "body": "TORSO",
      "shield": "SHIELD",
      "legs": "LEGS",
      "hands": "HANDS",
      "feet": "BOOTS",
      "2h": "WEAPON"
    };
    for (const slot in setData ){
      newExportedSet[slotMap[slot]] = `${setData[slot]} (${itemNames[setData[slot]]})`
    }
    console.log(newExportedSet)
    setExportedSet(newExportedSet)
    
  }

  //main app return statement
  return (
    <>
    <div className="app-container">
      <div className="title-bar">
      <p>Generate OSRS outfits in your favorite color range</p>
      </div>
      <div className="content-container">
        <div className="form-container">
         <GeneratorForm onGenerateSet={generateSet} />
        </div>
        <div className="set-container">
        {Object.values(gearSet).length !== 0 ? <GearVisualizer gearSet={gearSet} onExportSet={handleExportSet} onLockedSlot={handleLockedSlots} onRerollSlot={handleRerollSlot} lockedSlotsList={lockedSlots}/> : <p className="first-run">Choose a color mode above and Generate a Set!</p>}
        </div>
        <div className="exported-set-container">
      {Object.values(exportedSet).length !== 0 ? <><h1>Exported Gear Set:</h1>
      <pre style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <code>
      {Object.entries(exportedSet).map(([slot, item]) => (
        <p key={slot}>{slot}:{item}</p>
      ))}
      </code>
      </pre></> : ""}
    </div>
      </div>
    </div>
    </>
  );
}

export default App;
