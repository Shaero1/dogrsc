import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TurnstileResponse = {
  success: boolean;
  'error-codes'?: string[];
};

@Injectable()
export class CaptchaService {
  constructor(private readonly config: ConfigService) {}

  async verify(token: string | undefined): Promise<void> {
    if (this.config.get<string>('CAPTCHA_SKIP') === 'true') {
      return;
    }

    const secret = this.config.get<string>('CAPTCHA_SECRET_KEY');
    if (!secret) {
      throw new BadRequestException('Captcha is not configured on the server');
    }

    if (!token?.trim()) {
      throw new BadRequestException('Captcha verification is required');
    }

    const body = new URLSearchParams({
      secret,
      response: token.trim(),
    });

    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
    );

    if (!res.ok) {
      throw new BadRequestException('Captcha verification failed');
    }

    const data = (await res.json()) as TurnstileResponse;
    if (!data.success) {
      throw new BadRequestException('Captcha verification failed');
    }
  }
}
