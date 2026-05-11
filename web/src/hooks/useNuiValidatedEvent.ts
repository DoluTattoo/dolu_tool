import { treeifyError, z } from 'zod'
import { useNuiEvent } from './useNuiEvent'

interface ZodErrorTree {
  errors: string[]
  properties: Record<string, ZodErrorTree>
  items?: ZodErrorTree[]
}

const logErrorTree = (node: ZodErrorTree, path: string = '') => {
  if (node.errors?.length > 0) {
    node.errors.forEach((msg: string) => {
      console.log(`[Field: ${path || 'root'}] -> ${msg}`)
    })
  }

  if (node.properties) {
    for (const key in node.properties) {
      const currentPath = path ? `${path}.${key}` : key
      if (node.properties[key]) {
        logErrorTree(node.properties[key], currentPath)
      }
    }
  }

  if (Array.isArray(node.items)) {
    node.items.forEach((item: ZodErrorTree, index: number) => {
      logErrorTree(item, `${path}[${index}]`)
    })
  }
}

export function useNuiValidatedEvent<T>(
  eventName: string,
  schema: z.ZodSchema<T>,
  handler: (data: T) => void
) {
  useNuiEvent<unknown>(eventName, (rawData: unknown) => {
    const result = schema.safeParse(rawData)

    if (result.success) {
      handler(result.data)
    } else {
      const errorResult = treeifyError(result.error) as ZodErrorTree
      console.log(`[Validation Failed] Event: "${eventName}"`)
      console.log('-------------------------------------------')
      errorResult.errors?.forEach((err) => console.log(`[Root Error]: ${err}`))
      logErrorTree(errorResult)
      console.log('-------------------------------------------')
    }
  })
}