/**
 * Отправка писем по SMTP (почтовый ящик на сервере: info.enigma@enigmaz.ru)
 *
 * FRONTEND_URL в .env — адрес, по которому пользователи открывают сайт (без слэша в конце).
 * Ссылка в письме: FRONTEND_URL/verify-email?token=...
 * Пример: http://5.35.92.24:5173
 */

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '25', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(
      '[EMAIL] SMTP не настроен. Добавьте SMTP_HOST, SMTP_USER, SMTP_PASS в .env.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: 'localhost',      // ← Локальный адрес
  port: 25,               // ← Порт без TLS (или 587)
  secure: false,          // ← false для портов 25/587
  tls: {
    rejectUnauthorized: false  // ← Отключить проверку сертификата для localhost
  },
  });

  return transporter;
}

/**
 * Отправить письмо с ссылкой для подтверждения почты
 * @param {string} to - Email получателя
 * @param {string} token - Токен верификации
 * @param {string} nickname - Никнейм пользователя
 * @returns {Promise<{ sent: boolean, error?: string }>}
 */
async function sendVerificationEmail(to, token, nickname = 'пользователь') {
  const trans = getTransporter();
  if (!trans) {
    return { sent: false, error: 'SMTP не настроен (SMTP_HOST, SMTP_USER, SMTP_PASS в .env)' };
  }

  // Ссылка в письме — тот адрес, где открывается ваш фронт (из .env FRONTEND_URL)
  const rawUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/+$/, '');
  const frontendUrl = rawUrl || 'http://localhost:5173';
  const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const from = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@enigmaz.ru';

  const mailOptions = {
    from,
    to,
    subject: 'Подтвердите вашу почту — Enigmaz',
    text: `Здравствуйте, ${nickname}! Подтвердите почту: ${verifyUrl}\n\nСсылка действительна 24 часа. Если письмо не пришло — проверьте папку «Спам».`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-width=1.0">
  <title>Подтверждение почты</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f0f4f8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8; padding: 24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="padding: 32px 28px; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);">
              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #00ffff;">Enigmaz</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">Подтверждение почты</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #1a1a2e;">Здравствуйте, ${nickname}!</p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a5568;">Вы зарегистрировались на нашем сервисе. Нажмите кнопку ниже, чтобы подтвердить почту и завершить регистрацию.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
                <tr>
                  <td>
                    <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #00ffff 0%, #00d4ff 100%); color: #0a0a0f; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(0, 255, 255, 0.35);">Подтвердить почту</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; font-size: 13px; color: #718096;">Ссылка действительна 24 часа.</p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #718096;">Если кнопка не срабатывает, скопируйте ссылку в браузер:</p>
              <p style="margin: 0 0 24px; font-size: 12px; word-break: break-all; color: #00d4ff;">${verifyUrl}</p>
              <p style="margin: 0; font-size: 13px; color: #718096; padding: 12px; background: #edf2f7; border-radius: 8px;"><strong>Не нашли письмо?</strong> Проверьте папку «Спам».</p>
              <p style="margin: 24px 0 0; font-size: 12px; color: #a0aec0;">Если вы не регистрировались — проигнорируйте это письмо.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  try {
    await trans.sendMail(mailOptions);
    console.log('[EMAIL] Письмо подтверждения отправлено на', to);
    return { sent: true };
  } catch (err) {
    console.error('[EMAIL] SMTP ошибка:', err.message);
    return {
      sent: false,
      error: err.message || 'Ошибка отправки письма',
    };
  }
}

module.exports = {
  sendVerificationEmail,
};
