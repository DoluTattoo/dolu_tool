import { atom } from 'recoil'
import { z } from 'zod'
import { locationSchema } from './location'
import { versionSchema } from './version'

export const menuVisibilityAtom = atom({ key: 'menuVisibility', default: false })

export const emptyEventSchema = z.unknown()

export const menuVisiblePayloadSchema = z.object({
    version: versionSchema,
    lastLocation: locationSchema,
    position: z.string(),
})
