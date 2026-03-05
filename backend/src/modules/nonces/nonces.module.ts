import { Module } from '@nestjs/common';
import { NoncesService } from './nonces.service';
import { NoncesRepository } from './repositories/nonces.repository';

@Module({
  providers: [
    NoncesService,
    { provide: 'INoncesRepository', useClass: NoncesRepository },
  ],
  exports: [NoncesService],
})
export class NoncesModule {}
