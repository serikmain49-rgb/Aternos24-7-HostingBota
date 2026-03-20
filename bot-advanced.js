const mineflayer = require('mineflayer');

const BOT_CONFIG = {
  host: process.env.SERVER_IP || 'SMP-FRUTLINE.aternos.me',
  port: process.env.SERVER_PORT || 29506,
  username: process.env.BOT_NAME || 'WanderingBot',
  version: null, // Автоопределение
};

// Параметры поведения (можно менять через env переменные)
const BEHAVIOR = {
  jumpInterval: parseInt(process.env.JUMP_INTERVAL) || 800,      // мс между прыжками
  changeDirectionTime: parseInt(process.env.CHANGE_DIR_TIME) || 3000, // мс между сменой направления
  enableRotation: process.env.ENABLE_ROTATION !== 'false',        // вращение камеры
  enableAutoReconnect: process.env.AUTO_RECONNECT !== 'false',    // автопереподключение
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY) || 5000,  // мс до переподключения
};

let bot = null;
let isWalkingForward = true;
let movementInterval = null;
let jumpInterval = null;

function createBot() {
  bot = mineflayer.createBot(BOT_CONFIG);

  bot.on('login', () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`✓ Бот подключился к серверу`);
    console.log(`✓ Адрес: ${BOT_CONFIG.host}:${BOT_CONFIG.port}`);
    console.log(`✓ Версия сервера: ${bot.version}`);
    console.log(`✓ Ник бота: ${bot.username}`);
    console.log(`✓ Статус: ОНЛАЙН ${new Date().toLocaleTimeString()}`);
    console.log(`${'='.repeat(50)}\n`);
    
    startMovement();
    startJumping();
  });

  bot.on('spawn', () => {
    const pos = bot.entity.position;
    console.log(`📍 Местоположение: X=${pos.x.toFixed(1)} Y=${pos.y.toFixed(1)} Z=${pos.z.toFixed(1)}`);
  });

  bot.on('error', (err) => {
    console.error(`❌ Ошибка: ${err.message}`);
  });

  bot.on('kicked', (reason) => {
    console.log(`⚠️  Бот кикнут: ${reason}`);
    clearIntervals();
    if (BEHAVIOR.enableAutoReconnect) {
      setTimeout(createBot, BEHAVIOR.reconnectDelay);
    } else {
      process.exit(1);
    }
  });

  bot.on('end', () => {
    console.log(`⚠️  Соединение разорвано ${new Date().toLocaleTimeString()}`);
    clearIntervals();
    if (BEHAVIOR.enableAutoReconnect) {
      console.log(`🔄 Переподключение через ${BEHAVIOR.reconnectDelay}мс...`);
      setTimeout(createBot, BEHAVIOR.reconnectDelay);
    }
  });

  bot.on('death', () => {
    console.log('💀 Бот умер. Ожидание респавна...');
  });
}

function startMovement() {
  movementInterval = setInterval(() => {
    if (isWalkingForward) {
      bot.setControlState('forward', true);
      bot.setControlState('back', false);
    } else {
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
    }

    setTimeout(() => {
      isWalkingForward = !isWalkingForward;
      if (BEHAVIOR.enableRotation) {
        rotateHead();
      }
    }, BEHAVIOR.changeDirectionTime);
  }, 100);
}

function startJumping() {
  jumpInterval = setInterval(() => {
    if (bot.entity && !bot.entity.onGround) {
      // Уже прыгаем, не прыгаем повторно
      return;
    }
    
    bot.setControlState('jump', true);
    
    setTimeout(() => {
      bot.setControlState('jump', false);
    }, 100);
  }, BEHAVIOR.jumpInterval);
}

function rotateHead() {
  const yaw = Math.random() * Math.PI * 2;
  const pitch = (Math.random() - 0.5) * Math.PI * 0.5;
  bot.look(yaw, pitch);
}

function clearIntervals() {
  if (movementInterval) clearInterval(movementInterval);
  if (jumpInterval) clearInterval(jumpInterval);
}

function getStats() {
  if (!bot || !bot.entity) return null;
  
  const pos = bot.entity.position;
  return {
    health: bot.health,
    food: bot.food,
    position: `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`,
    dimension: bot.game.dimension,
    players: Object.keys(bot.players).length,
  };
}

// Логирование статистики каждые 10 минут
setInterval(() => {
  const stats = getStats();
  if (stats) {
    console.log(`📊 Статистика [${new Date().toLocaleTimeString()}]:`);
    console.log(`   HP: ${stats.health}/20`);
    console.log(`   Голод: ${stats.food}/20`);
    console.log(`   Позиция: ${stats.position}`);
    console.log(`   Игроков онлайн: ${stats.players}`);
  }
}, 10 * 60 * 1000);

// Обработка выключения
process.on('SIGINT', () => {
  console.log('\n⏹️  Завершение работы бота...');
  clearIntervals();
  if (bot) bot.quit();
  setTimeout(() => process.exit(0), 1000);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Завершение работы бота...');
  clearIntervals();
  if (bot) bot.quit();
  setTimeout(() => process.exit(0), 1000);
});

// Запуск
createBot();

console.log(`🤖 Minecraft bot запущен...`);
console.log(`📡 Параметры:`);
console.log(`   Прыжки: каждые ${BEHAVIOR.jumpInterval}мс`);
console.log(`   Смена направления: каждые ${BEHAVIOR.changeDirectionTime}мс`);
console.log(`   Вращение камеры: ${BEHAVIOR.enableRotation ? '✓' : '✗'}`);
console.log(`   Автопереподключение: ${BEHAVIOR.enableAutoReconnect ? '✓' : '✗'}\n`);
