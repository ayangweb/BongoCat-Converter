import type { deviceKeyMap, gamepadKeyMap } from "@/utils/keyMap";

export type ConfigKey = keyof typeof deviceKeyMap & keyof typeof gamepadKeyMap;

export type ConfigMatrix = ConfigKey[][];

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
