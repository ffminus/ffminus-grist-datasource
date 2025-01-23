import { DataSourcePlugin } from '@grafana/data';

import { Configuration } from './components/Configuration';
import { Editor } from './components/Editor';
import { DataSource } from './datasource';
import { Query, Options } from './types';

export const plugin = new DataSourcePlugin<DataSource, Query, Options>(DataSource)
  .setConfigEditor(Configuration)
  .setQueryEditor(Editor);
