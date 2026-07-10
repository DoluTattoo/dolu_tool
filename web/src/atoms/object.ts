import { atom, useAtomValue } from 'jotai'

export interface Entity {
    id: string
    handle: number
    name: string
    position: {
        x: number
        y: number
        z: number
    },
    rotation: {
        x: number
        y: number
        z: number
    },
    frozen?: boolean
    invalid?: boolean
}

export type ObjectList = Array<Entity>

export const ObjectListAtom = atom<ObjectList>([])
export const ObjectNameAtom = atom<string>('prop_alien_egg_01')
export const KeyboardLayoutAtom = atom<'QWERTY' | 'AZERTY'>('QWERTY')
export const TranslateSnapAtom = atom<number | undefined>(0)
export const RotateSnapAtom = atom<number | undefined>(0)

export const getObjectList = () => useAtomValue(ObjectListAtom)
