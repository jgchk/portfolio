export interface Response {
  statusCode: number
  body: ResponsePayload
}

export interface ResponsePayload {
  message: string
  event: EventPayload
}

export interface EventPayload {
  method: string
  query: QueryParameters
}

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface QueryParameters {}

/* eslint-disable-next-line import/prefer-default-export */
export const hello = async (event: EventPayload): Promise<Response> =>
  Promise.resolve({
    statusCode: 200,
    body: {
      message: 'Go Serverless v1.0! Your function executed successfully!',
      event,
    },
  })
