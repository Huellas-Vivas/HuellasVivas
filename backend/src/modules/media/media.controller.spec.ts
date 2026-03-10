import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: {
            upload: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    mediaService = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should call mediaService.upload with correct arguments and return the result', async () => {
      const mockFile = {
        originalname: 'test.png',
        buffer: Buffer.from('test'),
        mimetype: 'image/png',
        size: 1024,
      } as Express.Multer.File;
      
      const mockUserId = 'user-123';
      const mockResult = { url: 'https://test-url.com/image.png' };

      jest.spyOn(mediaService, 'upload').mockResolvedValue(mockResult);

      const result = await controller.upload(mockFile, mockUserId);

      expect(mediaService.upload).toHaveBeenCalledWith(mockFile, mockUserId);
      expect(result).toEqual(mockResult);
    });
  });
});
