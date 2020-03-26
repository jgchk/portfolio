import DynamoDB from 'aws-sdk/clients/dynamodb'
import { AWSError } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

const baseParams = {
  TableName: 'library',
}

export default class DB {
  db: DynamoDB.DocumentClient

  constructor() {
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
      .get({ ...baseParams, Key: query })
      .promise()
      .then(response => response.Item)
  }

  put<T>(
    item: T
  ): Promise<PromiseResult<DynamoDB.DocumentClient.PutItemOutput, AWSError>> {
    return this.db.put({ ...baseParams, Item: item }).promise()
  }

  batchPut<T>(
    items: T[]
  ): Promise<
    PromiseResult<DynamoDB.DocumentClient.BatchWriteItemOutput, AWSError>
  > {
    return this.db
      .batchWrite({
        RequestItems: {
          library: [
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
    return this.db.delete({ ...baseParams, Key: { id: key } }).promise()
  }
}
