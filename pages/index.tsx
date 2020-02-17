import React, { ReactElement } from 'react'
import { NextPageContext } from 'next'

interface Props {
  userAgent?: string
}

export default class Home extends React.Component<Props> {
  static getInitialProps({ req }: NextPageContext): { userAgent: string } {
    const userAgent = req
      ? req.headers['user-agent'] || ''
      : navigator.userAgent
    return { userAgent }
  }

  render(): ReactElement {
    const { userAgent } = this.props
    return (
      <h1>
        Hello world! - user agent:
        {userAgent}
      </h1>
    )
  }
}
