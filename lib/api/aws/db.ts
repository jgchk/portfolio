import DynamoDB from 'aws-sdk/clients/dynamodb'
import { AWSError } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

export default class DB {
  tableName: string

  baseParams: { TableName: string }

  db: DynamoDB.DocumentClient

  constructor(tableName: string) {
    this.tableName = tableName
    this.baseParams = {
      TableName: tableName,
    }

    this.db = new DynamoDB.DocumentClient({
      convertEmptyValues: true,
      service: new DynamoDB({
        apiVersion: '2012-08-10',
        region: 'us-east-1',
        accessKeyId: process.env.AWS_ID || '',
        secretAccessKey: process.env.AWS_SECRET || '',
      }),
    })
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  get(query: { [key: string]: any }): Promise<any | null | undefined> {
    return this.db
      .get({ ...this.baseParams, Key: query })
      .promise()
      .then(response => response.Item)
  }

  getAll(): Promise<DynamoDB.DocumentClient.ItemList | undefined> {
    return this.db
      .scan({ ...this.baseParams })
      .promise()
      .then(response => response.Items)
  }

  filter(options?: {
    column?: string
    startsWith?: string
  }): Promise<DynamoDB.DocumentClient.ItemList | undefined> {
    const params: DynamoDB.DocumentClient.ScanInput = { ...this.baseParams }
    if (options) {
      if (options.column && options.startsWith) {
        params.FilterExpression = `begins_with (${options.column}, :startsWith)`
        params.ExpressionAttributeValues = { ':startsWith': options.startsWith }
      }
    }

    return this.db
      .scan(params)
      .promise()
      .then(response => response.Items)
  }

  put<T>(
    item: T
  ): Promise<PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>> {
    return this.db.put({ ...this.baseParams, Item: item }).promise()
  }

  batchPut<T>(
    items: T[]
  ): Promise<
    PromiseResult<DynamoDB.DocumentClient.BatchWriteItemOutput, AWSError>
  > {
    return this.db
      .batchWrite({
        RequestItems: {
          [this.tableName]: [
            ...items.map(item => ({
              PutRequest: {
                Item: item,
              },
            })),
          ],
        },
      })
      .promise()
  }

  delete(
    key: string
  ): Promise<
    PromiseResult<DynamoDB.DocumentClient.DeleteItemOutput, AWSError>
  > {
    return this.db.delete({ ...this.baseParams, Key: { id: key } }).promise()
  }
}
