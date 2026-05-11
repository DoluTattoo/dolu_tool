import { atom, selector, useRecoilValue } from 'recoil'
import { z } from 'zod'

export const timecycleOptionSchema = z.object({
    label: z.string(),
    value: z.string(),
})

const flagValueSchema = z.union([z.string(), z.number()]).transform(String)

const interiorFlagsSchema = z.object({
    list: z.array(flagValueSchema),
    total: z.number(),
})

const roomSchema = z.object({
    index: z.number(),
    name: z.string(),
    timecycle: z.string(),
    isCurrent: z.boolean().optional(),
    flags: interiorFlagsSchema,
})

const portalSchema = z.object({
    index: z.number(),
    roomFrom: z.number(),
    roomTo: z.number(),
    flags: interiorFlagsSchema,
})

export const interiorDataSchema = z.object({
    interiorId: z.number(),
    roomCount: z.number().optional(),
    portalCount: z.number().optional(),
    rooms: z.array(roomSchema).optional(),
    portals: z.array(portalSchema).optional(),
    currentRoom: roomSchema.omit({ isCurrent: true }).optional(),
})

export type InteriorData = z.infer<typeof interiorDataSchema>

const mockInterior: InteriorData = {
    interiorId: -1
}

export const interiorAtom = atom<InteriorData>({ key: 'interior', default: mockInterior })
export const timecycleListAtom = atom<Array<{ label: string, value: string }>>({ key: 'timecycleList', default: [{label: "Unknown", value: '0'}] })
export const timecycleAtom = atom<string | null>({ key: 'timecycle', default: null })
export const portalDebuggingAtom = atom<string[]>({ key: 'portalDebugging', default: [] })
export const portalEditingIndexAtom = atom<number>({ key: 'portalEditingIndex', default: 0 })
export const portalDataAtom = atom<any>({ key: 'portalData', default: null })
export const portalFlagsAtom = atom<string[]|null>({ key: 'portalFlags', default: null })

export const getInteriorAtom = selector({
    key: 'getInterior',
    get: ({ get }) => {
        return get(interiorAtom)
    },
})

export const getPortalFlagListAtom = selector({
    key: 'getPortalFlagList',
    get: ({ get }) => {
        const interior = get(interiorAtom)
        const index = get(portalEditingIndexAtom)

        if (!interior.portals) return []

        return interior.portals[index].flags.list
    },
})

export const getInteriorData = () => useRecoilValue(getInteriorAtom)
export const getPortalFlagsList = () => useRecoilValue(getPortalFlagListAtom)
