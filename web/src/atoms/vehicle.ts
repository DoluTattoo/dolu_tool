import { atom, useRecoilValue } from 'recoil'
import { z } from 'zod'

export const vehiclePropSchema = z.object({
  hash: z.number(),
  name: z.string(),
  class: z.string(),
  displayName: z.string(),
  type: z.string(),
  dlc: z.string(),
  manufacturer: z.string(),
})

export type VehicleProp = z.infer<typeof vehiclePropSchema>

export const vehiclePageContentSchema = z.object({
  type: z.literal('vehicles'),
  content: z.array(vehiclePropSchema),
  maxPages: z.number(),
})

const mockVehicleList: VehicleProp[] = [
    {
      hash: -1216765807,
      name: "adder",
      class: "SUPER",
      displayName: "Adder",
      type: "CAR",
      dlc: "TitleUpdate",
      manufacturer: "Truffade"
    },
    {
      hash: -214906006,
      name: "jester3",
      class: "SPORT",
      displayName: "Jester Classic",
      type: "CAR",
      dlc: "mpassault",
      manufacturer: "Dinka"
    },
]

export const vehicleListSearchAtom = atom<string>({ key: 'vehicleListSearch', default: '' })
export const vehiclesActivePageAtom = atom<number>({ key: 'vehicleActivePage', default: 1 })
export const vehiclesPageCountAtom = atom<number>({ key: 'vehiclePageCount', default: 1})
export const vehiclesPageContentAtom = atom<VehicleProp[]>({ key: 'vehiclesPageContent', default: mockVehicleList })

export const getSearchVehicleInput = () => useRecoilValue(vehicleListSearchAtom) as string
