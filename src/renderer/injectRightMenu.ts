import iconHtml from '../app/assets/logo.svg?raw';
import { log } from '../logs';
const menuID = 'nekoimg-i2i-menu';

class imageContainer {
  src: string;

  constructor(src: string) {
    this.src = src;
  }

  async toBlob(): Promise<Blob | null> {
    if (this.src.startsWith('data:')) {
      return this.convertBase64ToBlob();
    } else if (this.src.startsWith('appimg://')) {
      return await this.convertImageUrlToBlob();
    } else {
      throw new Error('Unsupported src type');
    }
  }

  convertBase64ToBlob() {
    try {
      const base64Content = this.src.split(';base64,').pop();
      const binary = atob(base64Content ?? '');
      const length = binary.length;
      const bytes = new Uint8Array(new ArrayBuffer(length));
      for (let i = 0; i < length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: 'image/png' });
    } catch (e) {
      return null;
    }
  }

  async convertImageUrlToBlob() {
    const pathContent = this.src.split('appimg://').pop();
    return await window.imageSearch.getLocalFileAsBlob(decodeURIComponent(pathContent ?? ''));
  }
}

// reference https://github.com/xh321/LiteLoaderQQNT-QR-Decode/blob/master/src/qContextMenu.js#L12
const addQContextMenu = (qContextMenu: Element, icon: string, title: string, callback: Function) => {
  if (qContextMenu.querySelector(`#${menuID}`) != null) return;
  const tempEl = document.createElement('div');
  const selectorFirst = 'a.q-context-menu-item--normal:not([disabled="true"])'; // priority find normal menu item
  const selectorSecond = '.q-context-menu :not([disabled="true"])'; // rollback to find any menu item
  const menuItem = document.querySelector(selectorFirst) || document.querySelector(selectorSecond);
  if (menuItem) {
    tempEl.innerHTML = menuItem.outerHTML.replace(/<!---->/g, '');
  } else {
    log('No enabled menu item found.');
    tempEl.innerHTML = '';
  }
  const item: HTMLElement = tempEl.firstChild as HTMLElement;
  item.id = menuID;
  const iconElement = item.querySelector('.q-icon');
  if (iconElement) {
    (iconElement as HTMLElement).innerHTML = icon;
  }
  if (item.classList.contains('q-context-menu-item__text')) {
    item.innerText = title;
  } else {
    const textElement = item.querySelector('.q-context-menu-item__text');
    if (textElement) {
      (textElement as HTMLElement).innerText = title;
    }
  }
  item.addEventListener('click', async () => {
    await callback();
    qContextMenu.remove();
  });
  const separator = qContextMenu.querySelector('.q-context-menu-separator');
  separator === null ? qContextMenu.appendChild(item) : qContextMenu.insertBefore(item, separator);
};

export const addQContextMenuMain = async () => {
  let isRightClick: boolean = false;
  let imageObject: imageContainer | null = null;
  let imgEl: HTMLImageElement | null = null;
  const bodyElement = document.querySelector('body');
  const haveImgContent = (): boolean => {
    return imgEl !== null && imgEl.classList.contains('image-content') && !!imgEl.getAttribute('src');
  };
  if (bodyElement === null) {
    log('Cannot find bodyElement, inject addQContextMenuMain failed');
    return;
  }
  document.addEventListener('mouseup', (event) => {
    if (event.button === 2 && event.target instanceof HTMLImageElement) {
      isRightClick = true;
      imgEl = event.target;
      if (haveImgContent()) {
        imageObject = new imageContainer(imgEl.src?.toString());
      } else {
        imgEl = null;
        imageObject = null;
      }
    } else {
      isRightClick = false;
      imageObject = null;
    }
  });
  new MutationObserver(() => {
    const qContextMenu = document.querySelector('.q-context-menu');
    if (qContextMenu && imageObject) {
      const currentImageObject = imageObject;
      addQContextMenu(qContextMenu, iconHtml, 'Image Search', async () => {
        const fileBlobContent = await currentImageObject.toBlob();
        window.imageSearch.postAppImageSearchReq(fileBlobContent);
      });
    }
  }).observe(bodyElement, { childList: true });
};
