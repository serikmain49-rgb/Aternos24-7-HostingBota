const mineflayer = require('mineflayer');
const express = require('express');
const path = require('path');

// === КОНФИГУРАЦИЯ ===
const BOT_CONFIG = {
  host: process.env.SERVER_IP || 'SMP-FRUTLINE.aternos.me',
  port: parseInt(process.env.SERVER_PORT) || 29506,
  username: process.env.BOT_NAME || 'WanderingBot',
  version: null,
};

// === СОСТОЯНИЕ БОТА ===
let botState = {
  status: 'STARTING',
  uptime: 0,
  coordinates: { x: 0, y: 0, z: 0 },
  server: BOT_CONFIG.host,
  port: BOT_CONFIG.port,
  lastError: null,
  connectionAttempts: 0,
  startTime: Date.now(),
};

let bot = null;
let isWalkingForward = true;
let movementInterval = null;
let jumpInterval = null;
let uptimeInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 5000;

// === EXPRESS СЕРВЕР ДЛЯ DASHBOARD ===
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({
    ...botState,
    uptime: Math.floor((Date.now() - botState.startTime) / 1000),
  });
});

app.get('/api/logs', (req, res) => {
  res.json({
    status: botState.status,
    message: botState.lastError || 'Всё работает нормально',
    connectionAttempts: reconnectAttempts,
  });
});

app.listen(PORT, () => {
  console.log(`\n🌐 Dashboard доступен на: http://localhost:${PORT}`);
  console.log(`📡 API статуса: http://localhost:${PORT}/api/status\n`);
});

// === ФУНКЦИИ БОТА ===
function createBot() {
  console.log(`\n🔄 Попытка подключения #${reconnectAttempts + 1}...`);
  botState.status = 'CONNECTING';
  botState.connectionAttempts = reconnectAttempts + 1;

  bot = mineflayer.createBot(BOT_CONFIG);

  bot.on('login', () => {
    reconnectAttempts = 0; // Сброс счётчика при успехе
    botState.status = 'ONLINE';
    botState.lastError = null;
    botState.startTime = Date.now();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ БОТ ПОДКЛЮЧИЛСЯ К СЕРВЕРУ`);
    console.log(`📡 Сервер: ${BOT_CONFIG.host}:${BOT_CONFIG.port}`);
    console.log(`🎮 Ник: ${bot.username}`);
    console.log(`📦 Версия: ${bot.version}`);
    console.log(`${'='.repeat(60)}\n`);

    startMovement();
    startJumping();
    startUptimeCounter();
  });

  bot.on('spawn', () => {
    const pos = bot.entity.position;
    botState.coordinates = {
      x: Math.round(pos.x * 10) / 10,
      y: Math.round(pos.y * 10) / 10,
      z: Math.round(pos.z * 10) / 10,
    };
    console.log(`📍 Спавн: X=${botState.coordinates.x} Y=${botState.coordinates.y} Z=${botState.coordinates.z}`);
  });

  bot.on('move', () => {
    const pos = bot.entity.position;
    botState.coordinates = {
      x: Math.round(pos.x * 10) / 10,
      y: Math.round(pos.y * 10) / 10,
      z: Math.round(pos.z * 10) / 10,
    };
  });

  bot.on('error', (err) => {
    botState.lastError = err.message;
    console.error(`❌ Ошибка: ${err.message}`);
  });

  bot.on('kicked', (reason) => {
    botState.status = 'KICKED';
    botState.lastError = `Кикнут: ${reason}`;
    console.log(`⚠️ Бот кикнут: ${reason}`);
    clearIntervals();
    attemptReconnect();
  });

  bot.on('end', (reason) => {
    botState.status = 'DISCONNECTED';
    botState.lastError = `Отключено: ${reason}`;
    console.log(`⚠️ Соединение разорвано: ${reason}`);
    clearIntervals();
    attemptReconnect();
  });

  bot.on('death', () => {
    console.log(`💀 Бот умер. Ожидание респавна...`);
    botState.lastError = 'Бот мёртв (ожидание респавна)';
  });
}

function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    botState.status = 'FAILED';
    botState.lastError = `Не удалось подключиться после ${MAX_RECONNECT_ATTEMPTS} попыток. Проверь сервер.`;
    console.error(`\n❌ ${botState.lastError}`);
    console.log(`💡 Возможные проблемы:`);
    console.log(`   - Сервер Aternos спит (включи вручную)`);
    console.log(`   - Неправильный IP или порт`);
    console.log(`   - На сервере нет места\n`);
    return;
  }

  reconnectAttempts++;
  console.log(`⏳ Переподключение через ${RECONNECT_DELAY}мс... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  setTimeout(createBot, RECONNECT_DELAY);
}

function startMovement() {
  movementInterval = setInterval(() => {
    if (!bot || !bot.entity) return;

    if (isWalkingForward) {
      bot.setControlState('forward', true);
      bot.setControlState('back', false);
    } else {
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
    }

    setTimeout(() => {
      isWalkingForward = !isWalkingForward;
    }, 3000);
  }, 100);
}

function startJumping() {
  jumpInterval = setInterval(() => {
    if (!bot || !bot.entity) return;

    bot.setControlState('jump', true);
    setTimeout(() => {
      bot.setControlState('jump', false);
    }, 100);
  }, 800);
}

function startUptimeCounter() {
  uptimeInterval = setInterval(() => {
    botState.uptime = Math.floor((Date.now() - botState.startTime) / 1000);
  }, 1000);
}

function clearIntervals() {
  if (movementInterval) clearInterval(movementInterval);
  if (jumpInterval) clearInterval(jumpInterval);
  if (uptimeInterval) clearInterval(uptimeInterval);
}

// === ОБРАБОТКА ВЫКЛЮЧЕНИЯ ===
process.on('SIGINT', () => {
  console.log('\n⏹️ Завершение работы...');
  clearIntervals();
  if (bot) bot.quit();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Завершение работы...');
  clearIntervals();
  if (bot) bot.quit();
  process.exit(0);
});

// === ЗАПУСК ===
console.log(`\n🤖 Minecraft Bot запускается...`);
console.log(`⚙️ Конфиг:`);
console.log(`   Сервер: ${BOT_CONFIG.host}:${BOT_CONFIG.port}`);
console.log(`   Ник: ${BOT_CONFIG.username}`);
console.log(`   Максимум попыток переподключения: ${MAX_RECONNECT_ATTEMPTS}`);
console.log(`   Задержка переподключения: ${RECONNECT_DELAY}мс\n`);

createBot();
