declare module "zzfx" {
  export function zzfx(...parameters: (number | undefined)[]): AudioBufferSourceNode;
  export const ZZFX: {
    play(...parameters: (number | undefined)[]): AudioBufferSourceNode;
    volume: number;
    sampleRate: number;
    x: AudioContext;
  };
}
