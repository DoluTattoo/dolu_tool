import { atom, useRecoilValue } from 'recoil'
import { z } from 'zod'

export const locationSchema = z.object({
  name: z.string(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
  heading: z.number().optional(),
  custom: z.boolean().optional(),
  metadata: z.unknown().optional(),
  isLastLocationUsed: z.boolean().optional(),
})

export type Location = z.infer<typeof locationSchema>

export const locationPageContentSchema = z.object({
  type: z.literal('locations'),
  content: z.array(locationSchema),
  maxPages: z.number(),
})

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

export const lastLocationsAtom = atom<Location|null>({ key: 'lastLocations', default: null })
export const selectedLocationIdAtom = atom<string | null>({ key: 'selectedLocationId', default: null })

export const locationSearchAtom = atom<string>({ key: 'locationSearch', default: '' })
export const locationsActivePageAtom = atom<number>({ key: 'locationsActivePage', default: 1 })
export const locationsPageCountAtom = atom<number>({ key: 'locationsPageCount', default: 1 })
export const locationsPageContentAtom = atom<Location[]>({ key: 'locationsPageContent', default: mockLocations })

// Filter Checkboxes
export const locationVanillaFilterAtom = atom<boolean>({ key: 'locationVanillaFilter', default: false })
export const locationCustomFilterAtom = atom<boolean>({ key: 'locationCustomFilter', default: true })

export const getLastLocation = () => useRecoilValue(lastLocationsAtom)
export const getSearchLocationInput = () => useRecoilValue(locationSearchAtom) as string
