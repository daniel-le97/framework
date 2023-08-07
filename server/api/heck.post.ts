import { Context } from 'elysia'

export default (context: Context) => {
  return `Post id: ${context.params.postId}`
}