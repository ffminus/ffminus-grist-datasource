import {
  DataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  TestDataSourceResponse,
  createDataFrame,
  guessFieldTypeFromNameAndValue,
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
    return { data: await Promise.all(queries.map((query) => this.execute(query))) };
  }

  /** Run query against Grist HTTP API, convert result set into dataframe. */
  async execute({ q, refId }: Query): Promise<DataFrame> {
    // Pass query in JSON body to avoid leaking it in URL
    const body = { sql: q };

    // Execute query via HTTP API
    const { data } = await this.fetch<{ sql?: string }, { records: any[] }>('/sql', 'POST', body);

    // Convert result set into a dataframe Grafana understands
    return createDataFrame({ refId, fields: toDataFrameFields(data.records) });
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

/** Perform struct-of-array transformation, infer columns from first record. */
const toDataFrameFields = (records: any[]) =>
  records.length === 0
    ? []
    : Object.keys(records[0].fields).map((field) => ({
        name: field,
        values: records.map((record) => record.fields[field]),
        type: guessFieldTypeFromNameAndValue(field, records[0].fields[field]),
      }));
