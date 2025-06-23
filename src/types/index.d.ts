export type StandardConfig = {
  hand: number[][];
  keyboard: number[][];
};

export type SharedConfig = {
  lefthand: number[][];
  righthand: number[][];
  keyboard: number[][];
};

export interface Config {
  standard: StandardConfig;
  keyboard: SharedConfig;
  gamepad: SharedConfig;
}
