import { atom, useAtomValue } from 'jotai'

export interface Location {
  name: string,
  x: number,
  y: number,
  z: number,
  heading?: number,
  custom?: boolean
  metadata?: any,
  isLastLocationUsed?: boolean
}

const mockLocations: Location[] = [
    {
      name: "Custom Location test 1",
      x: 12,
      y: 11,
      z: 10,
      custom: true
    },
    {
      name: "Custom Location test 2",
      x: 12,
      y: 11,
      z: 10,
      heading: 150,
      custom: true,
      isLastLocationUsed: true
    },
    {
      name: "Vanilla Location 1",
      x: 12,
      y: 11,
      z: 10,
      heading: 150,
      custom: false,
    },
    {
      name: "Vanilla Location 2",
      x: 12,
      y: 11,
      z: 10,
      heading: 150,
      custom: false,
    },
]

export const lastLocationsAtom = atom<Location|null>(null)
export const selectedLocationIdAtom = atom<string | null>(null)

export const locationSearchAtom = atom<string>('')
export const locationsActivePageAtom = atom<number>(1)
export const locationsPageCountAtom = atom<number>(1)
export const locationsPageContentAtom = atom<Location[]>(mockLocations)

// Filter Checkboxes
export const locationVanillaFilterAtom = atom<boolean>(false)
export const locationCustomFilterAtom = atom<boolean>(true)

export const getLastLocation = () => useAtomValue(lastLocationsAtom)
export const getSearchLocationInput = () => useAtomValue(locationSearchAtom) as string
