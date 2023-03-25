import { useState } from "react";
import data from "./output.json"
import itemNames from "./ids_and_names.json"
import './App.css';
import logo from './logo.png';

/*
todo:
[]mejorar el algoritmo de los colores para los items multicolores
[]analizar si es productivo separar con mas granularidad o si quedarian muy poco poblados algunos sets del medio
[]refactorear el return de GearVisualizer para que cada slot esté donde tiene que estar
[]boton de exportar outfit - construir el objeto con formato Fashionscape, dartelo en un code box
[]boton de "lock slot" y de "reroll slot"
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
  const [hue, setHue] = useState(0);
  const [twoHands, setTwoHands] = useState(false);

  const handleHueChange = (event) => {
    setHue(parseInt(event.target.value));
  };

  const handleTwoHandsChange = (event) => {
    setTwoHands(event.target.checked);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onGenerateSet(hue, twoHands);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="hue">Hue?</label>
      <select id="hue" name="hue" value={hue} onChange={handleHueChange}>
        {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360].map(
          (h) => (
            <option key={h} value={h}>
              {h}
            </option>
          )
        )}
      </select>
      <label htmlFor="twoHands">Two handed weapons?</label>
      <input
        type="checkbox"
        id="twoHands"
        name="twoHands"
        checked={twoHands}
        onChange={handleTwoHandsChange}
      />
      <button type="submit">Generate Set</button>
    </form>
  );
}

function GearVisualizer({ gearSet }) {
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
        {itemNames[gearSet[slot]]}
      </div>
    );
  });

  return <div className="gear-visualizer">{slotComponents}</div>;
}

function App() {
  const [gearSet, setGearSet] = useState({});

  const generateSet = (hueRange, twoHands) => {
    const visibleSlots = twoHands
      ? ["2h", "body", "cape", "feet", "hands", "head", "legs", "neck"]
      : ["body", "cape", "feet", "hands", "head", "legs", "neck", "shield", "weapon"];

    const newGearSet = {};

    for (const slot of visibleSlots) {
      newGearSet[slot] = data[slot][`under_${hueRange}`][Math.floor(Math.random() * data[slot][`under_${hueRange}`].length)];
    }

    setGearSet(newGearSet);
  };

  

  return (
    <>
    <header className="App-header">
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <GeneratorForm onGenerateSet={generateSet} />
      <GearVisualizer gearSet={gearSet} />
    </div>
    </header>
    </>
  );
}

export default App;
