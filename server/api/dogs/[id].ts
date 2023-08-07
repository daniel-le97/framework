import { Context } from 'elysia'

export function get(context: Context) {
  return { wildcard: context.params.id }
}