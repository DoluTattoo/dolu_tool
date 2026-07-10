import { atom } from "jotai"

export interface StaticEmitter {
    name: string
    coords: string
    distance: number
    flags: string
    interior: string
    room: string
    radiostation: string
}

const mockStaticEmitters: StaticEmitter = {
    name: "collision_75oaiz",
    distance: 10,
    coords: "0.0, 12.2, 0.0",
    flags: "0xAA040011",
    interior: "none",
    room: "none",
    radiostation: "HIDDEN_RADIO_07_DANCE_01"
}

export const staticEmittersListAtom = atom<StaticEmitter>(mockStaticEmitters)
export const drawStaticEmittersAtom = atom<boolean>(false)
export const staticEmittersDrawDistanceAtom = atom<number>(20)
export const radioStationsListAtom = atom<Array<{ label: string, value: string }>>([{label: "Unknown", value: "0" }])
