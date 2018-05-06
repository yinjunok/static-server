const path = require('path');

const MIME = {
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

function getMime(ext) {
  if (ext && MIME[ext]) {
    return MIME[ext];
  }

  return 'text/plain'
}

module.exports = getMime;