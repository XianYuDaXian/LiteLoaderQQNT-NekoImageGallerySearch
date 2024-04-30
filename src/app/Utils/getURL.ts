import { useSearchStore } from '../States/searchWindowState';
import type { Image } from '../Models/Image';

export const getURL = (url: string) => {
  const store = useSearchStore();
  if (url.startsWith('/')) {
    return `${store.pluginSettingData.nekoimage_api}${url}`; // local url
  }
  return url; // s3 url
};

export const getPreviewURL = (pic: Image) => {
  if (pic.thumbnail_url) {
    return getURL(pic.thumbnail_url);
  }
  return getURL(pic.url);
};
