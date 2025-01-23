import { QueryEditorProps } from '@grafana/data';
import { EditorHeader, FlexItem, SQLEditor } from '@grafana/experimental';
import { Button } from '@grafana/ui';
import React from 'react';

import { DataSource } from '../datasource';
import { Options, Query } from '../types';

export const Editor = ({ query, onChange, onRunQuery }: QueryEditorProps<DataSource, Query, Options>) => (
  <>
    <EditorHeader>
      <FlexItem grow={1} />
      <Button icon="play" variant="primary" size="sm" onClick={onRunQuery}>
        Run query
      </Button>
    </EditorHeader>
    <SQLEditor query={query.q ?? ''} onChange={(q) => onChange({ ...query, q })}></SQLEditor>
  </>
);
