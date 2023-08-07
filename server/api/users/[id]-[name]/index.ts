import { Context } from 'elysia'

export default (context: Context) => {
  return `${context.params.id} AND ${context.params.name}`
}