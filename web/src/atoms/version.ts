import { atom } from 'recoil'
import { z } from 'zod'

export const versionSchema = z.object({
    currentVersion: z.string(),
    url: z.string().optional(),
})

export type Version = z.infer<typeof versionSchema>

export const versionAtom = atom<Version>({ key: 'version', default: { currentVersion: "" } })
