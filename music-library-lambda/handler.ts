import { updateLibrary } from '../lib/api/library'

export interface Response {
  statusCode: number
  body: ResponsePayload
}

export interface ResponsePayload {
  message: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  body?: any
  event: EventPayload
}

export interface EventPayload {
  method: string
  query: QueryParameters
}

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface QueryParameters {}

export const hello = async (event: EventPayload): Promise<Response> =>
  Promise.resolve({
    statusCode: 200,
    body: {
      message: 'Go Serverless v1.0! Your function executed successfully!',
      event,
    },
  })

export const update = async (event: EventPayload): Promise<Response> =>
  updateLibrary()
    .then(() => ({
      statusCode: 200,
      body: {
        message: 'Library updated!',
        event,
      },
    }))
    .catch(e => ({
      statusCode: 500,
      body: {
        message: 'Library failed to update.',
        body: e,
        event,
      },
    }))
