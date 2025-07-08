import type { keyMap } from "@/utils/keyMap";

type KeyCode = keyof typeof keyMap;

export type StandardConfig = {
  hand: KeyCode[][];
  keyboard: KeyCode[][];
};

export type SharedConfig = {
  lefthand: KeyCode[][];
  righthand: KeyCode[][];
  keyboard: KeyCode[][];
};

export interface ConfigSchema {
  standard: StandardConfig;
  keyboard: SharedConfig;
  gamepad: SharedConfig;
}
