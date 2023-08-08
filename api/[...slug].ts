import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function (request: VercelRequest, response: VercelResponse) {
  console.log(request.query)
  response.send('hello')
}
