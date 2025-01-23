import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

/** Configuration options for each data source instance. */
export interface Options extends DataSourceJsonData { }

/** Configuration values used by the backend but never sent to the frontend. */
export interface Secrets { }

/** Query string provided on execution. */
export interface Query extends DataQuery {
  q?: string;
}
