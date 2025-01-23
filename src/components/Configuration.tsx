import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import React, { ChangeEvent } from 'react';

import { Options, Secrets } from '../types';

/** Alias to shorten change event type name. */
type E = ChangeEvent<HTMLInputElement>;

/** Data source configuration component. */
export const Configuration = (props: DataSourcePluginOptionsEditorProps<Options, Secrets>) => {
  // Destructure object to access inner fields
  const { onOptionsChange: set, options } = props;

  // Force basic authentication in data source proxy
  if (options.basicAuth !== true) {
    set({ ...options, basicAuth: true });
  }

  // Update configuration on user action
  const onUrl = (event: E) => set({ ...options, url: event.target.value });
  const onDoc = (event: E) => set({ ...options, jsonData: { doc: event.target.value } });
  const onUser = (event: E) => set({ ...options, basicAuthUser: event.target.value });

  // Password is stored in separate structure, to stay on the server when proxying requests
  const onPass = (event: E) => set({ ...options, secureJsonData: { basicAuthPassword: event.target.value } });
  const onPassReset = () => set({ ...options, secureJsonFields: { basicAuthPassword: false }, secureJsonData: {} });

  // Password used to authenticate requests proxied by server
  const password = options.secureJsonData?.basicAuthPassword;

  return (
    <>
      <InlineField label="Url" labelWidth={14} interactive tooltip={'URL of Grist instance'}>
        <Input
          id="config-editor-url"
          required
          onChange={onUrl}
          value={options.url}
          placeholder="https://docs.getgrist.com"
          width={40}
        />
      </InlineField>
      <InlineField label="Doc" labelWidth={14} interactive tooltip={'Document to query data from'}>
        <Input
          id="config-editor-doc"
          required
          onChange={onDoc}
          value={options.jsonData.doc}
          placeholder="ab5LUan30oGz"
          width={40}
        />
      </InlineField>
      <InlineField label="User" labelWidth={14} interactive tooltip={'Basic Auth user to connect to server as'}>
        <Input
          id="config-editor-user"
          required
          onChange={onUser}
          value={options.basicAuthUser}
          placeholder="AzureDiamond"
          width={40}
        />
      </InlineField>
      <InlineField
        label="Password"
        labelWidth={14}
        interactive
        tooltip={'Basic Auth password to authenticate requests'}
      >
        <SecretInput
          id="config-editor-pass"
          required
          onChange={onPass}
          onReset={onPassReset}
          isConfigured={options.secureJsonFields.basicAuthPassword}
          value={password}
          placeholder="hunter2"
          width={40}
        />
      </InlineField>
    </>
  );
};
