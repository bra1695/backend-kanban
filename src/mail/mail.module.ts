import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
  imports: [
MailerModule.forRootAsync({
  useFactory: () => ({
    transport: {
      host: process.env.SMTP_HOST,
      port: 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    defaults: {
      from: `"No Reply" <${process.env.SMTP_USER}>`,
    },
    template: {
      //dir: join(__dirname, 'templates'),
      dir: join(process.cwd(), 'src/mail/templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
}),
  ],
  providers:[MailService],
  exports: [MailService]
})
export class MailModule {}
