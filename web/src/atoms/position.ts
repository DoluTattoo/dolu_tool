import { atom, useAtomValue } from 'jotai'

const mockPosition: string = "0, 0, 0"

export const positionAtom = atom<string>(mockPosition)
export const getPosition = () => useAtomValue(positionAtom)
