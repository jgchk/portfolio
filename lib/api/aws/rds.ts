import { AWSError } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import RDSDataService from 'aws-sdk/clients/rdsdataservice'

import { notEmpty } from '../../types'

const rds = new RDSDataService({
  apiVersion: '2018-08-01',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ID || '',
  secretAccessKey: process.env.AWS_SECRET || '',
})

const baseParams = {
  resourceArn: process.env.RDS_ARN || '',
  secretArn: process.env.RDS_SECRET_ARN || '',
}

export function createTables(): Promise<
  PromiseResult<RDSDataService.ExecuteStatementResponse, AWSError>
> {
  const params = {
    sql: `CREATE TABLE soundcloud (
			client_id VARCHAR(32) PRIMARY KEY,
			used BIT NOT NULL,
			expired BIT NOT NULL
		);`,
    database: 'keystore',
    ...baseParams,
  }
  return rds.executeStatement(params).promise()
}

function asBit(bool: boolean): number {
  return bool ? 1 : 0
}

export function addClientId(
  clientId: string
): Promise<PromiseResult<RDSDataService.ExecuteStatementResponse, AWSError>> {
  const used = false
  const expired = false
  const params = {
    sql: `INSERT INTO soundcloud (client_id, used, expired)
		VALUES ('${clientId}', ${asBit(used)}, ${asBit(expired)})`,
    database: 'keystore',
    ...baseParams,
  }
  return rds.executeStatement(params).promise()
}

export function editClientId(
  clientId: string,
  {
    used,
    expired,
  }: {
    used?: boolean
    expired?: boolean
  }
): Promise<PromiseResult<RDSDataService.ExecuteStatementResponse, AWSError>> {
  const queryParts = ['UPDATE soundcloud']
  const setParts = []
  if (notEmpty(used)) setParts.push(`used = ${asBit(used)}`)
  if (notEmpty(expired)) setParts.push(`expired = ${asBit(expired)}`)
  if (setParts.length > 0) queryParts.push('SET', setParts.join(', '))
  queryParts.push(`WHERE client_id = '${clientId}'`)

  const params = {
    sql: queryParts.join(' '),
    database: 'keystore',
    ...baseParams,
  }
  return rds.executeStatement(params).promise()
}

export function filterClientIds({
  used,
  expired,
}: {
  used?: boolean
  expired?: boolean
}): Promise<string[]> {
  const queryParts = ['SELECT client_id, used, expired FROM soundcloud']
  const whereParts = []
  if (notEmpty(used)) whereParts.push(`used = ${asBit(used)}`)
  if (notEmpty(expired)) whereParts.push(`expired = ${asBit(expired)}`)
  if (whereParts.length > 0) queryParts.push('WHERE', whereParts.join(' AND '))

  const params = {
    sql: queryParts.join(' '),
    database: 'keystore',
    ...baseParams,
  }
  return rds
    .executeStatement(params)
    .promise()
    .then(response => {
      if (response.records)
        return response.records
          .map(record => record[0].stringValue)
          .filter(notEmpty)
      throw Error('no records in response')
    })
}
