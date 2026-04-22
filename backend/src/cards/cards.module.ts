import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksModule } from '../decks/decks.module';
import { Card } from './entities/card.entity';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [TypeOrmModule.forFeature([Card]), DecksModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
