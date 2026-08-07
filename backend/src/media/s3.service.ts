import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DEFAULT_MEDIA_PRESIGNED_TTL_SECONDS } from './media.constants';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly presignedTtlSeconds: number;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>('S3_BUCKET');
    this.presignedTtlSeconds = this.config.get<number>(
      'MEDIA_PRESIGNED_TTL_SECONDS',
      DEFAULT_MEDIA_PRESIGNED_TTL_SECONDS,
    );

    const forcePathStyle =
      this.config.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true';

    this.client = new S3Client({
      region: this.config.get<string>('S3_REGION', 'us-east-1'),
      endpoint: this.config.getOrThrow<string>('S3_ENDPOINT'),
      forcePathStyle,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow<string>('S3_SECRET_KEY'),
      },
    });
  }

  async putObject(key: string, body: Buffer, mimeType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    );
  }

  async getPresignedGetUrl(
    key: string,
    expiresInSeconds = this.presignedTtlSeconds,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}
