import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  TestDataSourceResponse,
  createDataFrame,
} from '@grafana/data';

import { Query, Options } from './types';

export class DataSource extends DataSourceApi<Query, Options> {
  /** URL of data source, proxied by server. */
  readonly url: string;

  /** Document to use as data source. */
  readonly doc: string;

  constructor(instanceSettings: DataSourceInstanceSettings<Options>) {
    super(instanceSettings);

    this.url = instanceSettings.url!;
    this.doc = instanceSettings.jsonData.doc;
  }

  /** Check whether we can connect to the API. */
  async testDatasource(): Promise<TestDataSourceResponse> {
    return { status: 'error', message: 'TODO' };
  }

  /** Query for data, and optionally stream results. */
  async query({ targets: queries }: DataQueryRequest<Query>): Promise<DataQueryResponse> {
    return { data: await Promise.all(queries.map(({ refId }) => createDataFrame({ refId, fields: [] }))) };
  }
}
