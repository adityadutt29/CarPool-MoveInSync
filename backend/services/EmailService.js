const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
require('dotenv').config();

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
} = process.env;

/**
 * EmailService: handles all email notifications.
 * Implements simple retry logic (up to 3 attempts).
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: +SMTP_PORT,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Bypass SSL verification for development
      }
    });
    logger.info('EmailService initialized (SMTP host: %s)', SMTP_HOST);
  }

  /**
   * Send an email with retry.
   * @param {Object} params { to, subject, text, html }
   * @returns {Promise<string>} messageId
   */
  async send({ to, subject, text, html }) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const info = await this.transporter.sendMail({
          from: FROM_EMAIL,
          to,
          subject,
          text,
          html
        });
        logger.info('Email sent to %s (attempt %d): %s', to, attempt, info.messageId);
        return info.messageId;
      } catch (err) {
        logger.warn('Email send failed (attempt %d): %s', attempt, err.message);
        if (attempt === maxAttempts) {
          logger.error('All email attempts failed for %s', to);
          throw err;
        }
        await new Promise(r => setTimeout(r, 2000 * attempt)); // exponential backoff: 2s, 4s
      }
    }
  }
}

module.exports = new EmailService();