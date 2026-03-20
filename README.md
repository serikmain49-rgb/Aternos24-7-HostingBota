# Minecraft Java Bot для Render.com

Бот, который 24/7 прыгает и ходит вперед-назад на Minecraft Java сервере.

## 🚀 Возможности

✅ Автоматическое определение версии сервера  
✅ Постоянное движение вперед-назад (каждые 3 сек меняет направление)  
✅ Регулярные прыжки (каждые 0.8 сек)  
✅ Переподключение при разрыве соединения  
✅ Работает 24/7 на Render Free  

## 📋 Требования

- GitHub аккаунт (для репозитория)
- Render.com аккаунт (бесплатно)
- Minecraft Java сервер с открытым доступом

## 🔧 Локальное тестирование

```bash
# Установка зависимостей
npm install

# Запуск с переменными окружения
SERVER_IP=SMP-FRUTLINE.aternos.me SERVER_PORT=29506 BOT_NAME=MyBot npm start

# Или отредактируй значения по умолчанию в bot.js
```

## 📦 Деплой на Render

### Шаг 1: Загруз на GitHub

```bash
git init
git add .
git commit -m "Initial commit: minecraft bot"
git remote add origin https://github.com/ТВОЙ_НИК/minecraft-bot.git
git push -u origin main
```

### Шаг 2: Создай сервис на Render

1. Перейди на [render.com](https://render.com) и залогинься
2. Нажми **"New +"** → **"Web Service"**
3. Выбери свой GitHub репозиторий
4. Заполни поля:

| Поле | Значение |
|------|----------|
| **Name** | minecraft-bot |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node bot.js` |
| **Instance Type** | Free |

### Шаг 3: Переменные окружения

В разделе **Environment** добавь:

```
SERVER_IP=SMP-FRUTLINE.aternos.me
SERVER_PORT=29506
BOT_NAME=WanderingBot
```

(или любое имя для бота)

### Шаг 4: Запуск

Нажми **"Create Web Service"** → через 2-3 минуты бот будет онлайн ✅

## 📊 Логи и мониторинг

В Render → **Logs** можно смотреть статус бота в реальном времени:

```
✓ Бот подключился к серверу
✓ Версия сервера: 1.20.1
✓ Ник бота: WanderingBot
✓ Бот заспавнился на сервере
```

## ⚙️ Кастомизация поведения

### Изменить скорость прыжков

В `bot.js` найди строку:
```javascript
}, 800); // Прыгает каждые 0.8 секунд
```

Измени `800` на нужное значение в миллисекундах:
- `500` = быстрые прыжки
- `1000` = медленные прыжки
- `200` = очень быстро

### Изменить время смены направления

Найди:
```javascript
}, 3000); // Меняем направление каждые 3 секунды
```

Измени `3000` на нужное значение.

### Добавить вращение головы

Добавь в `startMovement()`:
```javascript
// Случайное вращение головы
const yaw = Math.random() * Math.PI * 2;
const pitch = (Math.random() - 0.5) * Math.PI;
bot.look(yaw, pitch);
```

## 🐛 Решение проблем

### "Bot kicked from server"
- Проверь IP и порт сервера
- Убедись что на сервере есть место
- На Aternos сервер может быть офлайн, включи его вручную

### "Cannot find module 'mineflayer'"
```bash
npm install
```

### Бот не переподключается
Это нормально — на Render Free есть лимиты. Перезапусти вручную или используй Render paid план для стабильности.

## 📝 Структура файлов

```
minecraft-bot/
├── bot.js           # Основной скрипт
├── package.json     # Зависимости
├── Dockerfile       # Для Render
└── README.md        # Этот файл
```

## 💡 Советы

- Если Aternos сервер спит, бот не сможет подключиться. Держи сервер включенным.
- Render Free может рестартироваться время от времени — это нормально.
- Для 100% стабильности используй платный хостинг (Railway, Replit, PythonAnywhere и т.д.)

## 📚 Ссылки

- [mineflayer документация](https://github.com/PrismarineJS/mineflayer)
- [Render документация](https://render.com/docs)
- [Node.js версии на Render](https://render.com/docs/node-js)

---

**Удачи с ботом! 🎮**
