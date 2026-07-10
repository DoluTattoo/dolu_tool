import { atom, useAtomValue } from 'jotai'

export interface InteriorData {
    interiorId: number
    roomCount?: number
    portalCount?: number
    position?: {
        x: number
        y: number
        z: number
    }
    rotation?: {
        x: number
        y: number
        z: number
        w: number
    }
    extents?: {
        min: {
            x: number
            y: number
            z: number
        }
        max: {
            x: number
            y: number
            z: number
        }
    }
    rooms?: Array<{
        index: number
        name: string
        timecycle: string
        isCurrent: boolean
        flags: {
            list: string[]
            total: number
        }
    }>
    portals?: Array<{
        index: number
        roomFrom: number
        roomTo: number
        flags: {
            list: string[]
            total: number
        }
    }>
    currentRoom?: {
        index: number
        name: string
        timecycle: string
        flags: {
            list: string[]
            total: number
        }
    }
}

const mockInterior: InteriorData = {
    interiorId: -1
}

export const interiorAtom = atom<InteriorData>(mockInterior)
export type TimecycleOption = { label: string, value: string, varCount?: number }
export const timecycleListAtom = atom<TimecycleOption[]>([{label: "Unknown", value: '0'}])
export const timecycleAtom = atom<string | null>(null)
export const portalDebuggingAtom = atom<string[]>([])
export const portalEditingIndexAtom = atom<number>(0)
export const portalDataAtom = atom<any>(null)
export const portalFlagsAtom = atom<string[]|null>(null)

export const getInteriorAtom = atom((get) => get(interiorAtom))

export const getPortalFlagListAtom = atom((get) => {
    const interior = get(interiorAtom)
    const index = get(portalEditingIndexAtom)

    if (!interior.portals) return []

    return interior.portals[index].flags.list
})

export const getInteriorData = () => useAtomValue(getInteriorAtom)
export const getPortalFlagsList = () => useAtomValue(getPortalFlagListAtom)
