import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { EnvAdapter } from '../../Adapter/EnvAdapter';
import { pluginSettingsModel } from '../../Models/pluginSettingsModel';

let apiClient: AxiosInstance | null;
let pluginSettingData: pluginSettingsModel | null = new pluginSettingsModel('', '', '');

EnvAdapter.getSettings().then((settings) => {
  pluginSettingData = settings;
});

export function getClient() {
  if (!apiClient) {
    const headers = {
      'X-Access-Token': pluginSettingData?.nekoimage_access_token,
      'X-Admin-Token': pluginSettingData?.nekoimage_admin_token
    };
    apiClient = axios.create({
      baseURL: pluginSettingData?.nekoimage_api,
      headers: headers
    });
  }

  return apiClient;
}

export function resetClient() {
  apiClient = null;
}
