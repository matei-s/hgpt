import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('user prompt:', req.url)

  const prompt = fs.readFileSync('prompt.txt', 'utf-8')

  const gptResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-16k',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: req.url || '/',
      },
    ],
    temperature: 1,
    max_tokens: 3500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  res.send(gptResponse.data.choices[0].message?.content || '')
}
