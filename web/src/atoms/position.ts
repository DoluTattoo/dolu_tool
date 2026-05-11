import { atom, useRecoilValue } from 'recoil'
import { z } from 'zod'

export const playerCoordsSchema = z.object({
    coords: z.string(),
    heading: z.string(),
})

const mockPosition: string = "0, 0, 0"

export const positionAtom = atom<string>({ key: 'position', default: mockPosition })
export const getPosition = () => useRecoilValue(positionAtom)
