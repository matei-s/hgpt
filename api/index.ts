import { kv } from '@vercel/kv'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const systemPrompt =
    (await kv.get<string>('__prompt')) ||
    'Generate a webpage. Output only the webpage html content.'
  const userPrompt = req.url || '/'

  const cachedWebpage = await kv.get<string>(userPrompt)

  if (cachedWebpage) {
    console.log('cache hit:', userPrompt)
    return res.send(cachedWebpage)
  }

  console.log('cache miss:', userPrompt)
  const gptResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-16k',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 1,
    max_tokens: 3500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  const webpage = gptResponse.data.choices[0].message?.content || ''
  await kv.set(userPrompt, webpage)

  res.send(webpage)
}
