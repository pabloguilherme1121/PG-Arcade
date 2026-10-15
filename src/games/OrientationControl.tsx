import { useState } from "react";
import { readOrientationPreference, saveOrientationPreference, type OrientationPreference } from "../lib/landscapeOrientation";
export default function OrientationControl() {
  const [value, setValue] = useState(readOrientationPreference);
  return <label>Orientação em tela cheia
    <select aria-label="Orientação em tela cheia" value={value} onChange={event => {
      const next = event.target.value as OrientationPreference;
      setValue(next); saveOrientationPreference(next);
    }}>
      <option value="auto">Automática por jogo</option>
      <option value="portrait">Vertical</option>
      <option value="landscape">Horizontal</option>
    </select>
    <small>Depende do navegador. Você também pode girar o aparelho manualmente.</small>
  </label>;
}
