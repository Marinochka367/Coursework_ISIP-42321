const fs = require('fs');
const path = require('path');

function resolveUploadPath(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return null;
  return path.join(__dirname, '..', 'public', imagePath);
}

function deleteUploadIfExists(imagePath) {
  const absolutePath = resolveUploadPath(imagePath);
  if (!absolutePath) return;

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error('Не удалось удалить файл:', absolutePath, error);
  }
}

module.exports = {
  deleteUploadIfExists
};
