import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { lookup } from 'mime-types';

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import r2Config from '../../config/r2.config';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicDomain: string;

  constructor(
    @Inject(r2Config.KEY)
    private readonly config: ConfigType<typeof r2Config>,
  ) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: 'auto',
      credentials: {
        accessKeyId: config.accessKeyId!,
        secretAccessKey: config.secretAccessKey!,
      },
    });
    this.bucket = config.bucket!;
    this.publicDomain = config.publicDomain!;
  }

  async uploadFile(key: string, buffer: Buffer, contentType?: string): Promise<string> {
    try {
      const mimeType = contentType || lookup(key) || 'application/octet-stream';

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      const url = `${this.publicDomain}/${key}`;
      this.logger.log(`File uploaded successfully: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error}`);
      throw error;
    }
  }

  extractKeyFromUrl(url: string): string | null {
    if (!url.startsWith(this.publicDomain)) {
      return null;
    }
    return url.substring(this.publicDomain.length + 1);
  }
}
