import DiscogsOAuth, { OAuth } from './oauth'
import DiscogsDatabase from './database'
import { Marketplace } from './marketplace'
import { User } from './user'
import { HTTPMethod } from '../types'

class Client {
  constructor(auth?: OAuth.Auth)

  constructor(userAgent?: string, auth?: OAuth.Auth)

  config: Client.Config

  auth: OAuth.Auth

  setConfig(customConfig: Client.Config): Client

  authenticated(level: number): boolean

  getIdentity(): Promise<Client.Identity>

  getIdentity(callback: (err: Error, identity: Client.Identity) => void): Client

  about(): Promise<Client.About>

  about(callback: (error: Error, about: Client.About) => void): Client

  get(options: Client.RequestOptions | string): Promise

  get(
    options: Client.RequestOptions | string,
    callback: (err: Error, response) => void
  ): Client

  post(options: Client.RequestOptions | string): Promise

  post(
    options: Client.RequestOptions | string,
    callback: (err: Error, response) => void
  ): Client

  put(options: Client.RequestOptions | string): Promise

  put(
    options: Client.RequestOptions | string,
    callback: (err: Error, response) => void
  ): Client

  delete(options: Client.RequestOptions | string): Promise

  delete(
    options: Client.RequestOptions | string,
    callback: (err: Error, response) => void
  ): Client

  oauth(): DiscogsOAuth

  database(): DiscogsDatabase

  marketplace(): Marketplace

  user(): User
}

function Client(auth?: OAuth.Auth): Client
function Client(userAgent?: string, auth?: OAuth.Auth): Client

export default Client

export namespace Client {
  export interface Config {
    host: string
    port: number
    userAgent: string
    apiVersion: string
    outputFormat: 'discogs' | 'plaintext' | 'html'
    requestLimit: number
    requestLimitAuth: number
    requestLimitInterval: number
  }

  export interface Identity {
    id: number
    username: string
    resource_url: string
    consumer_name: string
  }

  export interface About {
    documentation_url: string
    statistics: {
      labels: number
      releases: number
      artists: number
    }
    hello: string
    api_version: string
    disconnect: {
      version: string
      userAgent: string
      authMethod: string
      authLevel: number
    }
  }

  export interface RequestOptions {
    url: string
    method?: HTTPMethod
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: Record<string, any>
    encoding?: string
    json?: boolean
    queue?: boolean
    authLevel?: number
  }
}
