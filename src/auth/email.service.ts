import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendResetPasswordEmail(email: string, resetToken: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: email,
      subject: 'Réinitialisation de mot de passe - SkillSwap',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #666; font-size: 14px;">
            Ce lien expirera dans 1 heure.
          </p>
          <p style="color: #666; font-size: 14px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            SkillSwap Campus - Plateforme d'échange de compétences
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de réinitialisation envoyé à:', email);
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      throw error;
    }
  }
}