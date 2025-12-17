const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем директорию для загрузки файлов заданий, если её нет
const uploadDir = path.join(__dirname, '..', 'uploads', 'tasks');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла: timestamp-random.txt
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.txt';
    cb(null, `task-${uniqueSuffix}${ext}`);
  }
});

// Фильтр файлов - только .txt
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/plain' || path.extname(file.originalname).toLowerCase() === '.txt') {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только файлы .txt'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB максимум
  }
});

module.exports = upload;

