import { SelectItem } from "@mantine/core"
import { atom } from "recoil"
import { z } from "zod"

export const selectItemSchema = z.object({
    label: z.string(),
    value: z.string(),
})

export const staticEmitterSchema = z.object({
    name: z.string(),
    coords: z.string(),
    distance: z.number(),
    flags: z.string(),
    interior: z.string(),
    room: z.string(),
    radiostation: z.string(),
})

export type StaticEmitter = z.infer<typeof staticEmitterSchema>

const mockStaticEmitters: StaticEmitter = {
    name: "collision_75oaiz",
    distance: 10,
    coords: "0.0, 12.2, 0.0",
    flags: "0xAA040011",
    interior: "none",
    room: "none",
    radiostation: "HIDDEN_RADIO_07_DANCE_01"
}

export const staticEmittersListAtom = atom<StaticEmitter>({ key: 'staticEmittersList', default: mockStaticEmitters })
export const drawStaticEmittersAtom = atom<boolean>({ key: 'drawStaticEmittersAtom', default: false })
export const staticEmittersDrawDistanceAtom = atom<number>({ key: 'staticEmittersDrawDistance', default: 20 })
export const radioStationsListAtom = atom<Array<{ label: string, value: string }>>({ key: 'radioStationsList', default: [{label: "Unknown", value: "0" }]})
