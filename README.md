# Wunderteig Pizzamobil

Готовый Next.js сайт с адаптивным дизайном и кнопками WhatsApp/Telegram.

## Запуск

```bash
npm install
npm run dev
```

Затем открой http://localhost:3000

## WhatsApp и Telegram

Открой `app/page.js` и в самом начале замени:

- `WHATSAPP` — номер без `+`, пробелов и скобок.
- `TELEGRAM` — имя пользователя Telegram без `@`.

Например:
`WHATSAPP = "491701234567"`
`TELEGRAM = "wunderteig"`

Сайт уже содержит:
- адаптивный дизайн;
- меню;
- карточки пицц;
- WhatsApp-заказ с готовым текстом;
- Telegram;
- мобильную плавающую кнопку WhatsApp;
- секцию для мероприятий;
- SEO title/description.
