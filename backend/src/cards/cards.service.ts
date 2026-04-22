import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DecksService } from '../decks/decks.service';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly repo: Repository<Card>,
    private readonly decksService: DecksService,
  ) {}

  async create(userId: string, dto: CreateCardDto): Promise<Card> {
    await this.decksService.findOwned(userId, dto.deckId);
    const card = this.repo.create({
      front: dto.front,
      back: dto.back,
      example: dto.example ?? null,
      deckId: dto.deckId,
    });
    return this.repo.save(card);
  }

  async findByDeck(userId: string, deckId: string): Promise<Card[]> {
    await this.decksService.findOwned(userId, deckId);
    return this.repo.find({
      where: { deckId },
      order: { createdAt: 'ASC' },
    });
  }

  async update(userId: string, id: string, dto: UpdateCardDto): Promise<Card> {
    const card = await this.findOwnedCard(userId, id);
    Object.assign(card, dto);
    return this.repo.save(card);
  }

  async remove(userId: string, id: string): Promise<void> {
    const card = await this.findOwnedCard(userId, id);
    await this.repo.remove(card);
  }

  private async findOwnedCard(userId: string, id: string): Promise<Card> {
    const card = await this.repo.findOne({
      where: { id },
      relations: { deck: true },
    });
    if (!card) throw new NotFoundException('Card not found');
    if (card.deck.userId !== userId) throw new ForbiddenException();
    return card;
  }
}
