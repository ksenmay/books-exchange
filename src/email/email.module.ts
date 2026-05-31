import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailPublisher } from './email.publisher';

@Module({
  imports: [ConfigModule],
  providers: [EmailPublisher],
  exports: [EmailPublisher],
})
export class EmailModule {}
