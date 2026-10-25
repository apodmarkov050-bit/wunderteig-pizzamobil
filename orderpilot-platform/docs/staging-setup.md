# Подключение тестовых заказов к Supabase

Инструкция касается только отдельного Supabase-проекта `orderpilot-platform-staging`. Не подключай проект `orderpilot-db` и не копируй его ключи.

## Что реализовано в платформе

- Клиентская страница создаёт заказ через серверный API.
- Статус заказа хранится в таблице `platform_demo_orders` и обновляется со стороны ресторана.
- Страница клиента и ресторанная панель опрашивают сервер каждые 5 секунд, поэтому заказ виден между разными ярлыками, браузерами и устройствами.
- Браузеры не получают Supabase secret key. Сервер использует его для чтения и записи; таблица закрыта от `anon` и `authenticated`.
- Доступ к списку заказов ресторана защищён отдельным `RESTAURANT_DEMO_ACCESS_CODE`.

## Однократная настройка тестовой базы

1. Открой Supabase Dashboard именно для `orderpilot-platform-staging`.
2. Перейди в **SQL Editor**, открой файл `supabase/migrations/202610250003_platform_demo_orders.sql` из этой папки, вставь его содержимое и нажми **Run**.
3. В настройках проекта Supabase скопируй Project URL, publishable key и secret key. Secret key не отправляй в чат и не добавляй в исходники.
4. Для локального запуска сохрани значения в `orderpilot-platform/.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<staging-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<staging-publishable-key>
SUPABASE_SECRET_KEY=<staging-secret-key>
RESTAURANT_DEMO_ACCESS_CODE=<придумай-код-для-панели-ресторана>
```

5. Для Preview добавь те же четыре переменные в **Vercel → проект `orderpilot-platform-demo` → Settings → Environment Variables**, выбрав окружение **Preview**. Не выбирай Production. После этого создай новый Preview deployment.
6. Открой клиентскую ссылку и ресторанную ссылку в разных вкладках или на разных устройствах. В ресторане введи `RESTAURANT_DEMO_ACCESS_CODE`; создай тестовый заказ на клиентской странице.

Если Supabase проекта пока не содержит таблицу, API покажет, что заказы не удалось сохранить. Если в Preview не заданы серверный secret key или access code, экран ресторана не подключится. Не вставляй значения secret key в публичные переменные с префиксом `NEXT_PUBLIC_`.

Эта демонстрация предназначена только для вымышленных данных и не отправляет SMS, WhatsApp или реальные заказы в ресторан.
