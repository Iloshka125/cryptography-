const pool = require('../config/database');

async function updateCategoryIconFieldSize() {
  try {
    console.log('Обновление размера поля icon в таблице categories...');
    
    // Увеличиваем размер поля icon до VARCHAR(50) для поддержки строковых значений
    // Используем USING для преобразования существующих значений
    await pool.query(`
      ALTER TABLE categories 
      ALTER COLUMN icon TYPE VARCHAR(50) USING icon::VARCHAR(50);
    `);
    
    console.log('✓ Размер поля icon в таблице categories успешно обновлен до VARCHAR(50)');
  } catch (err) {
    // Если поле уже имеет правильный размер или другой тип ошибки
    if (err.code === '42704') {
      // Столбец не существует - это нормально
      console.log('Поле icon еще не существует');
    } else if (err.code === '42804' || err.message.includes('already')) {
      console.log('Поле icon уже имеет правильный размер');
    } else {
      console.error('Ошибка при обновлении размера поля icon:', err.message);
    }
  }
}

module.exports = updateCategoryIconFieldSize;


