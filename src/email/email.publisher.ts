import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqplib from 'amqplib';
import { UserRegisteredEvent } from './user-registered.event';

@Injectable()
export class EmailPublisher {
  private readonly logger = new Logger(EmailPublisher.name);
  private connection: any = null;
  private channel: any = null;

  constructor(private readonly config: ConfigService) {}

  private async getChannel() {
    if (this.channel) return this.channel;

    const rabbitUrl =
      this.config.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672';

    if (!this.connection) {
      this.connection = await amqplib.connect(rabbitUrl);
    }

    const channel = await this.connection.createChannel();

    const queue =
      this.config.get<string>('RABBITMQ_QUEUE_NAME') ?? 'user.registered';

    await channel.assertQueue(queue, { durable: true });
    this.channel = channel;

    return channel;
  }

  async publishUserRegistered(payload: UserRegisteredEvent) {
    const channel = await this.getChannel();
    const queue =
      this.config.get<string>('RABBITMQ_QUEUE_NAME') ?? 'user.registered';
    const body = Buffer.from(JSON.stringify(payload));

    channel.sendToQueue(queue, body, { persistent: true });
    this.logger.log(`Published to ${queue}: ${JSON.stringify(payload)}`);
  }
}
