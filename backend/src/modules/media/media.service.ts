import { Injectable, Logger } from '@nestjs/common';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { SupabaseService } from '../../database/supabase.service';
import { AppException } from '../../common/exceptions/app.exception';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async upload(file: Express.Multer.File, userId: string): Promise<{ url: string }> {
    if (file.size > MAX_FILE_SIZE)
      throw new AppException('FILE_TOO_LARGE', 'File must not exceed 5 MB', 400);

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
      throw new AppException(
        'FILE_TYPE_NOT_ALLOWED',
        `Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        400,
      );

    const ext = extname(file.originalname);
    const filename = `${userId}/${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;

    const { data, error } = await this.supabase.adminClient.storage
      .from('media')
      .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });

    if (error) {
      this.logger.error('Supabase storage upload failed', error);
      throw new AppException('UPLOAD_FAILED', 'File upload failed', 502);
    }

    const {
      data: { publicUrl },
    } = this.supabase.adminClient.storage.from('media').getPublicUrl(data.path);

    this.logger.log(`File uploaded: ${data.path}`);
    return { url: publicUrl };
  }
}
