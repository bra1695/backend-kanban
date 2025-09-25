import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private async sendMail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ) {
    await this.mailerService.sendMail({
      to,
      subject,
      template, // e.g. "forgot-password" or "confirm-account"
      context,
      attachments: [
        {
          filename: 'logo-dark.png',
          path: path.join(process.cwd(), 'src/mail/templates/logo-dark.png'),
          cid: 'logo',
        },
      ],
    });
  }

  async sendForgotPassword(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return this.sendMail(email, 'Reset your password', 'forgot-password', {
      resetUrl,
      year: new Date().getFullYear(),
    });
  }

  async sendAccountConfirmation(email: string, token: string) {
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-account?token=${token}`;
    return this.sendMail(email, 'Confirm your account', 'confirm-account', {
      confirmUrl,
      year: new Date().getFullYear(),
    });
  }
}
