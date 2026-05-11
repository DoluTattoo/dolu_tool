import { atom, useRecoilValue } from 'recoil'
import { z } from 'zod'

export const vector3Schema = z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
})

export const entitySchema = z.object({
    id: z.string().optional(),
    handle: z.number(),
    name: z.string(),
    position: vector3Schema,
    rotation: vector3Schema,
    frozen: z.boolean().optional(),
    invalid: z.boolean().optional(),
}).transform((entity) => ({
    ...entity,
    id: entity.id ?? String(entity.handle),
}))

export type Entity = z.infer<typeof entitySchema>

export type ObjectList = Array<Entity>

export const objectListPayloadSchema = z.object({
    entitiesList: z.array(entitySchema).nullable(),
})

export const objectDataPayloadSchema = z.object({
    entity: entitySchema,
})

export const transformEntitySchema = z.object({
    name: z.string().default(''),
    hash: z.number().default(0),
    handle: z.number().default(0),
    position: vector3Schema,
    rotation: vector3Schema,
    id: z.string().optional(),
})

export const transformEntityPayloadSchema = transformEntitySchema.optional()

export const cameraPositionSchema = z.object({
    position: vector3Schema,
    rotation: vector3Schema.optional(),
})

export const ObjectListAtom = atom<ObjectList>({key: "ObjectList", default: []})
export const ObjectNameAtom = atom<string>({ key: 'ObjectCurrentAccordionItem', default: 'prop_alien_egg_01' })
export const KeyboardLayoutAtom = atom<'QWERTY' | 'AZERTY'>({ key: 'KeyboardLayout', default: 'QWERTY' })
export const TranslateSnapAtom = atom<number | undefined>({ key: 'TranslateSnap', default: 0 })
export const RotateSnapAtom = atom<number | undefined>({ key: 'RotateSnap', default: 0 })

export const getObjectList = () => useRecoilValue(ObjectListAtom)
