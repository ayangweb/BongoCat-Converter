import type { keyMap } from "@/utils/keyMap";

export type ConfigMatrix = (keyof typeof keyMap)[][];

export type StandardConfig = {
  hand: ConfigMatrix;
  keyboard: ConfigMatrix;
};

export type SharedConfig = {
  lefthand: ConfigMatrix;
  righthand: ConfigMatrix;
  keyboard: ConfigMatrix;
};

export interface ConfigSchema {
  standard: StandardConfig;
  keyboard: SharedConfig;
  gamepad: SharedConfig;
}
