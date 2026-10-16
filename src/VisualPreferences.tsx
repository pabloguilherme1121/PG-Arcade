import type { Dispatch, SetStateAction } from "react";
import type { Preferences } from "./lib/preferences";

export default function VisualPreferences({ preferences, setPreferences }: { preferences: Preferences; setPreferences: Dispatch<SetStateAction<Preferences>> }) {
  return <>
          <div className="preference-options">
            <label>
              <input
                type="checkbox"
                checked={preferences.contrast}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    contrast: e.target.checked,
                  }))
                }
              />
              Alto contraste
            </label>
            <label>
              Movimento
              <select
                aria-label="Movimento da interface"
                value={preferences.motion}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    motion: e.target.value as "system" | "reduced",
                  }))
                }
              >
                <option value="system">Preferência do aparelho</option>
                <option value="reduced">Reduzir efeitos</option>
              </select>
            </label>
            <label>
              Tamanho dos controles
              <select
                aria-label="Tamanho dos controles"
                value={preferences.controls}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    controls: e.target.value as "standard" | "large",
                  }))
                }
              >
                <option value="standard">Padrão</option>
                <option value="large">Ampliados</option>
              </select>
            </label>
          </div>
          <p>
            As opções valem para todos os jogos. Reduzir efeitos mantém os
            movimentos necessários para jogar; controles ampliados aumentam os
            principais alvos de toque sem alterar os tabuleiros.
          </p>
  </>;
}
