import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import path from 'path';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendForgotPassword(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: 'forgot-password', 
      context: {
        resetUrl,
        year: 2025      },
        attachments: [
  {
    filename: 'logo-dark.png', // use png for better compatibility
    path: path.join(process.cwd(), 'src/mail/templates/logo-dark.png'),
    cid: 'logo', // must match src="cid:logo"
  },
],
    });
  }
}
