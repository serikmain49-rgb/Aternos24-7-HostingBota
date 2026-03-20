const mineflayer = require('mineflayer');

const BOT_CONFIG = {
  host: process.env.SERVER_IP || 'SMP-FRUTLINE.aternos.me',
  port: process.env.SERVER_PORT || 29506,
  username: process.env.BOT_NAME || 'FrutlineBot',
  version: null, // Автоопределение
};

const bot = mineflayer.createBot(BOT_CONFIG);

let isWalkingForward = true;
let movementInterval = null;
let jumpInterval = null;

bot.on('login', () => {
  console.log(`✓ Бот подключился к серверу`);
  console.log(`✓ Версия сервера: ${bot.version}`);
  console.log(`✓ Ник бота: ${bot.username}`);
  
  startMovement();
  startJumping();
});

bot.on('spawn', () => {
  console.log('✓ Бот заспавнился на сервере');
});

bot.on('error', (err) => {
  console.error('❌ Ошибка:', err.message);
});

bot.on('kicked', (reason) => {
  console.log('⚠️ Бот кикнут с сервера:', reason);
  process.exit(1);
});

bot.on('end', () => {
  console.log('⚠️ Соединение разорвано. Переподключение через 5 сек...');
  clearIntervals();
  setTimeout(() => {
    createNewBot();
  }, 5000);
});

// Функция движения вперед-назад
function startMovement() {
  movementInterval = setInterval(() => {
    if (isWalkingForward) {
      bot.setControlState('forward', true);
      bot.setControlState('back', false);
    } else {
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
    }
    
    // Меняем направление каждые 3 секунды
    setTimeout(() => {
      isWalkingForward = !isWalkingForward;
    }, 3000);
  }, 100);
}

// Функция прыжков
function startJumping() {
  jumpInterval = setInterval(() => {
    bot.setControlState('jump', true);
    
    setTimeout(() => {
      bot.setControlState('jump', false);
    }, 100);
  }, 800); // Прыгает каждые 0.8 секунд
}

// Очистка интервалов
function clearIntervals() {
  if (movementInterval) clearInterval(movementInterval);
  if (jumpInterval) clearInterval(jumpInterval);
}

// Обработка выключения процесса
process.on('SIGINT', () => {
  console.log('\n✓ Завершение работы бота...');
  clearIntervals();
  bot.quit();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('✓ Завершение работы бота...');
  clearIntervals();
  bot.quit();
  process.exit(0);
});
