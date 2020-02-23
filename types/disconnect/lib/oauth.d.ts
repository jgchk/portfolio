import { HTTPMethod } from '../types'

export default class OAuth {
  constructor(auth?: OAuth.Auth)

  config: OAuth.Config

  auth: OAuth.Auth

  setConfig(customConfig: OAuth.Config): OAuth

  getRequestToken: (
    consumerKey: string,
    consumerSecret: string,
    callbackUrl: string,
    callback: (err: Error, auth: OAuth.RequestToken) => void
  ) => OAuth

  getAccessToken: (
    verifier: string,
    callback: (err: Error, auth: OAuth.AccessToken) => void
  ) => OAuth

  export(): OAuth.Auth

  toHeader(requestMethod: HTTPMethod, url: string): string
}

export namespace OAuth {
  export interface AuthOptions {
    method: string
    level: number
  }

  export interface AuthLevel1 extends Partial<AuthOptions> {
    consumerKey: string
    consumerSecret: string
  }

  export interface AuthLevel2 extends Partial<AuthOptions> {
    userToken: string
  }

  export type Auth = AuthLevel1 | AuthLevel2

  export interface Config {
    requestTokenUrl: string
    accessTokenUrl: string
    authorizeUrl: string
    version: string
    signatureMethod: 'PLAINTEXT' | 'HMAC-SHA1'
  }

  export interface RequestToken extends Auth {
    token: string
    tokenSecret: string
    authorizeUrl: string
  }

  export interface AccessToken extends Auth {
    token: string
    tokenSecret: string
    level: number
  }
}
