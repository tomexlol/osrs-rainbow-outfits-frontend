import { useState } from "react";
import data from "./output.json"
import itemNames from "./ids_and_names.json"
import './App.css';

/*
todo:
[]mejorar el algoritmo de los colores para los items multicolores
[X]analizar si es productivo separar con mas granularidad o si quedarian muy poco poblados algunos sets del medio
  it is not, its fine as is
[X]refactorear el return de GearVisualizer para que cada slot esté donde tiene que estar
[X]added black white gray
[]boton de exportar outfit - construir el objeto con formato Fashionscape, dartelo en un code box
[X]boton de "lock slot"
 [] y de "reroll slot" (es guardar lockedslots, settearlo a "everything but this", mandarle generate, recuperar viejo lockedSlots)
[]incorporarlo a tomexlol.com cuando esté medianamente funcional y bonito, agregar css etc
[]escribir un blogpost desglosando qué hace y cómo para pegar laburo xdxd


*/


const images = {};
function importAll(r) {
  r.keys().forEach((key) => (images[key] = r(key)));
}
importAll(require.context("./icons", false, /\.png$/));

//const iconSrc = images[`./${itemId}.png`];

function GeneratorForm({ onGenerateSet }) {
  const [hue, setHue] = useState(30);
  const [twoHands, setTwoHands] = useState(false);
  const [hueString, setHueString] = useState("");
  const handleHueChange = (event) => {
    setHue(parseInt(event.target.value));
    const button = document.querySelector('button[type="submit"]');
    button.style.backgroundColor = `hsl(${parseInt(event.target.value) >= 120 ? parseInt(event.target.value) + 100 : parseInt(event.target.value) + 15 }, 100%, 50%)`;
    parseInt(event.target.value) === 150 ? button.style.color = "white" : button.style.color = "black"
  };

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

  const handleColorModeChange = (event) => {
    const slider = document.getElementsByClassName('color-slider')[0];
    if (event.target.value === "color"){
      slider.style.display = ""
      setHueString(false)
    } else {slider.style.display = "none"}
    setHueString(event.target.value)
  }


  const handleSubmit = (event) => {
    event.preventDefault();
    if (hueString !== "color") {onGenerateSet(hueString, twoHands)} else {onGenerateSet(hue, twoHands)};
  };

  
  return (
    <form id = "gear-form" onSubmit={handleSubmit}>
      <input className="color-slider" type="range" min="30" max="210" step="30" value={hue} onChange={handleHueChange}></input>
      <label><input type="radio" name="color-mode" value="color" onChange={handleColorModeChange}/> Color </label>
      <label><input type="radio" name="color-mode" value="black" onChange={handleColorModeChange}/> Black </label>
      <label><input type="radio" name="color-mode" value="white" onChange={handleColorModeChange}/> White </label>
      <label><input type="radio" name="color-mode" value="gray" onChange={handleColorModeChange} /> Gray </label>
      <div className="form-input-container">
      <label htmlFor="twoHands">Use 2h weapons</label>
      <input
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

function GearVisualizer({ gearSet, onLockedSlot }) {
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
  const slotComponents = visibleSlots.map((slot) => {
    const itemId = gearSet[slot];
    const itemIcon = images[`./${itemId}.png`];
    return (
      <div key={slot} className={slot}>
        <img src={itemIcon} alt={itemId} />
        <br></br>
        {itemNames[gearSet[slot]]}
        <br></br>
        <button data-slot={slot} className="lock-button" type="button" onClick={() => onLockedSlot(slot, 1)}>L</button>
      </div>
    );
  });

  return <div className="gear-visualizer">{slotComponents}</div>;
}

function App() {
  const [gearSet, setGearSet] = useState({});
  const [lockedSlots, setLockedSlots] = useState([]);

  const handleLockedSlots = (slot) => {
    if (typeof lockedSlots === "object" && lockedSlots.includes(slot)){
      //remove
      let newLockedSlots = [...lockedSlots]
      console.log(newLockedSlots)
      let filterLockedSlots = newLockedSlots.filter(item => item !== slot);
      setLockedSlots(filterLockedSlots)
    } else if (typeof lockedSlots === "object" && !lockedSlots.includes(slot))
    {
      //add
      let newLockedSlots = lockedSlots
      newLockedSlots.push(slot)
      setLockedSlots(newLockedSlots)

    }
     else {
      //add first
      console.log("case 3")
      let newLockedSlots = []
      newLockedSlots.push(slot)
      setLockedSlots(newLockedSlots)
      console.log("setting to:")
      console.log(newLockedSlots)
     } 
    }
  

  const generateSet = (hueRange, twoHands) => {
    const visibleSlotsBase = twoHands
      ? ["2h", "body", "cape", "feet", "hands", "head", "legs", "neck"]
      : ["body", "cape", "feet", "hands", "head", "legs", "neck", "shield", "weapon"];

    const newGearSet = {};

    const visibleSlots = visibleSlotsBase.filter((slot) => !lockedSlots.includes(slot));


    if (typeof hueRange === "number"){
      for (const slot of visibleSlots) {
       newGearSet[slot] = data[slot][`under_${hueRange}`][Math.floor(Math.random() * data[slot][`under_${hueRange}`].length)];
    }
  }
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
        {gearSet["head"] || gearSet["feet"] ? <GearVisualizer gearSet={gearSet} onLockedSlot={handleLockedSlots}/> : "gear not generated yet"}
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
