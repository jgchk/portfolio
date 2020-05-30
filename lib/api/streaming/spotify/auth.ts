import got from 'got'
import { AuthResponse } from './types'

const clientId = process.env.SPOTIFY_ID
const clientSecret = process.env.SPOTIFY_SECRET

let accessToken: string | undefined
let expireTime = new Date()

export default async function getAccessToken(): Promise<string> {
  if (expireTime > new Date() && accessToken !== undefined)
    // return saved token if it's still good
    return accessToken

  if (clientId === undefined) throw Error('spotify id not found')
  if (clientSecret === undefined) throw Error('spotify secret not found')

  const Authorization = `Basic ${Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString('base64')}`

  const { body } = await got<AuthResponse>(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',
      responseType: 'json',
      headers: { Authorization },
      form: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        grant_type: 'client_credentials',
      },
    }
  )

  accessToken = body.access_token
  expireTime = new Date(expireTime.getTime() + 1000 * body.expires_in)

  return accessToken
}
