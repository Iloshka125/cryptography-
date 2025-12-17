const pool = require('../config/database');

async function updateAvatarFieldSize() {
  try {
    console.log('Обновление размера поля avatar...');
    
    // Увеличиваем размер поля avatar до VARCHAR(50) для поддержки строковых значений
    // Используем USING для преобразования существующих значений
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN avatar TYPE VARCHAR(50) USING avatar::VARCHAR(50);
    `);
    
    console.log('✓ Размер поля avatar успешно обновлен до VARCHAR(50)');
  } catch (err) {
    // Если поле уже имеет правильный размер или другой тип ошибки
    if (err.code === '42704') {
      // Столбец не существует - это нормально, он будет создан при addProfileFields
      console.log('Поле avatar еще не существует, будет создано при addProfileFields');
    } else if (err.code === '42804' || err.message.includes('already')) {
      console.log('Поле avatar уже имеет правильный размер');
    } else {
      console.error('Ошибка при обновлении размера поля avatar:', err.message);
    }
  }
}

module.exports = updateAvatarFieldSize;

