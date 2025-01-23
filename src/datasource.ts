import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  TestDataSourceResponse,
  createDataFrame,
} from '@grafana/data';
import { getBackendSrv, isFetchError, FetchResponse } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';

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
    try {
      // Hit document metadata endpoint to test data source connection
      const resp = await this.fetch('/');

      // Forward error mesage to user on failure
      return resp.status === 200 ? { status: 'success', message: 'Success' } : fail(resp.statusText);
    } catch (err) {
      // Display different error messages depending on kind of failure
      return typeof err === 'string' ? fail(err) : isFetchError(err) ? fail(err.statusText) : fail();
    }
  }

  /** Query for data, and optionally stream results. */
  async query({ targets: queries }: DataQueryRequest<Query>): Promise<DataQueryResponse> {
    return { data: await Promise.all(queries.map(({ refId }) => createDataFrame({ refId, fields: [] }))) };
  }

  /** Perform requests against data source via server-provided proxy. */
  async fetch<B, R>(path: string, method?: string, data?: B): Promise<FetchResponse<R>> {
    // Proxy request through server to let backend handle authentication
    const url = `${this.url}/api/docs/${this.doc}${path}`;

    // Convert observable into a promise, then perform fetch request
    return await lastValueFrom(getBackendSrv().fetch<R>({ url, method, data }));
  }
}

/** Structure error message according to format expected by Grafana. */
const fail = (message?: string): TestDataSourceResponse => ({ status: 'error', message: message ?? 'Unknown error' });
