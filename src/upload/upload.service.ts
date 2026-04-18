import { createClient } from '@supabase/supabase-js';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import multer from 'multer';

@Injectable()
export class UploadService {
  private supabase;
  private bucket: string;

  constructor(private config: ConfigService) {
    const supabaseUrl = config.get('SUPABASE_URL');
    const supabaseKey = config.get('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase config is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucket = config.get<string>('SUPABASE_STORAGE_BUCKET', 'review-media');
  }

  async uploadReviewMedia(file: Express.Multer.File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!allowed.includes(file.mimetype))
      throw new BadRequestException({
        code: 'INVALID_FILE_TYPE',
        message: 'File type not supported',
      });
    if (file.size > 10 * 1024 * 1024)
      throw new BadRequestException({
        code: 'FILE_TOO_LARGE',
        message: 'File exceeds 10 MB limit',
      });

    const ext = file.originalname.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `reviews/${name}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });

    if (error) throw new BadRequestException('Upload failed: ' + error.message);

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.bucket).getPublicUrl(path);

    return {
      url: publicUrl,
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
    };
  }
}
