import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { SupabaseService } from '../../database/supabase.service';
import { AppException } from '../../common/exceptions/app.exception';

const USER_ID = 'user-uuid-123';
const PUBLIC_URL = 'https://supabase.example.com/storage/v1/object/public/media/user-uuid-123/file.jpg';

const makeFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
  fieldname: 'file',
  originalname: 'photo.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  buffer: Buffer.from('fake-image-data'),
  stream: null as any,
  destination: '',
  filename: '',
  path: '',
  ...overrides,
});

const makeStorageMock = (uploadResult: object, publicUrl = PUBLIC_URL) => ({
  from: jest.fn().mockReturnValue({
    upload: jest.fn().mockResolvedValue(uploadResult),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl } }),
  }),
});

describe('MediaService', () => {
  let service: MediaService;
  let supabase: { adminClient: { storage: ReturnType<typeof makeStorageMock> } };

  beforeEach(async () => {
    supabase = {
      adminClient: {
        storage: makeStorageMock({ data: { path: 'user-uuid-123/123-abc.jpg' }, error: null }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile();

    service = module.get(MediaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── FILE_TOO_LARGE ──────────────────────────────────────────────────────────
  describe('upload — file size validation', () => {
    it('throws FILE_TOO_LARGE when file.size exceeds 5 MB', async () => {
      const file = makeFile({ size: 5 * 1024 * 1024 + 1 });

      await expect(service.upload(file, USER_ID))
        .rejects
        .toMatchObject({ code: 'FILE_TOO_LARGE' });
    });

    it('does not throw for a file exactly at the 5 MB limit', async () => {
      const file = makeFile({ size: 5 * 1024 * 1024 });

      await expect(service.upload(file, USER_ID)).resolves.toEqual({ url: PUBLIC_URL });
    });
  });

  // ─── FILE_TYPE_NOT_ALLOWED ───────────────────────────────────────────────────
  describe('upload — MIME type validation', () => {
    it('throws FILE_TYPE_NOT_ALLOWED for video/mp4', async () => {
      const file = makeFile({ mimetype: 'video/mp4', originalname: 'clip.mp4' });

      await expect(service.upload(file, USER_ID))
        .rejects
        .toMatchObject({ code: 'FILE_TYPE_NOT_ALLOWED' });
    });

    it('throws FILE_TYPE_NOT_ALLOWED for text/plain', async () => {
      const file = makeFile({ mimetype: 'text/plain', originalname: 'notes.txt' });

      await expect(service.upload(file, USER_ID))
        .rejects
        .toMatchObject({ code: 'FILE_TYPE_NOT_ALLOWED' });
    });

    it.each(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])(
      'accepts allowed MIME type %s',
      async (mimetype) => {
        const ext = mimetype === 'application/pdf' ? '.pdf' : '.img';
        const file = makeFile({ mimetype, originalname: `file${ext}` });

        await expect(service.upload(file, USER_ID)).resolves.toEqual({ url: PUBLIC_URL });
      },
    );
  });

  // ─── Supabase storage interaction ────────────────────────────────────────────
  describe('upload — Supabase storage', () => {
    it('calls storage.from("media").upload with correct bucket, filename and contentType', async () => {
      const file = makeFile();
      await service.upload(file, USER_ID);

      const fromMock = supabase.adminClient.storage.from;
      expect(fromMock).toHaveBeenCalledWith('media');

      const uploadMock = fromMock.mock.results[0].value.upload;
      expect(uploadMock).toHaveBeenCalledTimes(1);

      const [filename, buffer, options] = uploadMock.mock.calls[0];
      expect(filename).toMatch(new RegExp(`^${USER_ID}/\\d+-[a-f0-9]+\\.jpg$`));
      expect(buffer).toEqual(file.buffer);
      expect(options).toEqual({ contentType: 'image/jpeg', upsert: false });
    });

    it('returns { url: publicUrl } on success', async () => {
      const file = makeFile();
      const result = await service.upload(file, USER_ID);

      expect(result).toEqual({ url: PUBLIC_URL });
    });

    it('throws UPLOAD_FAILED when Supabase storage returns an error', async () => {
      supabase.adminClient.storage = makeStorageMock({
        data: null,
        error: new Error('Storage unavailable'),
      });

      const file = makeFile();

      await expect(service.upload(file, USER_ID))
        .rejects
        .toMatchObject({ code: 'UPLOAD_FAILED' });
    });

    it('throws UPLOAD_FAILED with 502 status when Supabase storage errors', async () => {
      supabase.adminClient.storage = makeStorageMock({
        data: null,
        error: new Error('Bucket not found'),
      });

      const file = makeFile();

      await expect(service.upload(file, USER_ID))
        .rejects
        .toBeInstanceOf(AppException);

      await expect(service.upload(file, USER_ID))
        .rejects
        .toMatchObject({ code: 'UPLOAD_FAILED' });
    });
  });
});
