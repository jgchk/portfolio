import got from 'got'
import Bluebird from 'bluebird'

export default async function getClientId(): Promise<string> {
  const { body } = await got('https://soundcloud.com')

  const scriptUrls = Array.from(
    body.matchAll(/<script crossorigin src="(.+)"><\/script>/gm)
  ).map(match => match[1])

  const clientIdRegex = /{client_id:"([a-zA-Z0-9]+)"}/
  const clientId = await Bluebird.any(
    scriptUrls.map(async scriptUrl => {
      const { body: script } = await got(scriptUrl)
      const match = clientIdRegex.exec(script)
      if (match === null) throw Error('client id not found')
      return match[1]
    })
  )

  if (!clientId) throw Error('no client id found')
  return clientId
}
