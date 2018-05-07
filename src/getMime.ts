const path = require('path');

interface MIMETYPE {
  [prop: string]: string,
}

const MIME: MIMETYPE = {
  'html': 'text/html',
  'txt': 'text/txt',
  'css': 'text/css',
  'js': 'text/javascript',

  'gif': 'image/gif',
  'png': 'image/png',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpg',
  'bmp': 'image/bmp',
  'webp': 'image/webp',
  'ico': 'image/x-icon',
};

function getMime(ext: string): string {
  if (ext && MIME[ext]) {
    return MIME[ext];
  }

  return 'text/plain'
}

export default getMime;
