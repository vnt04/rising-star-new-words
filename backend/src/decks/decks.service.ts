import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deck } from './entities/deck.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DecksService {
  constructor(
    @InjectRepository(Deck)
    private readonly repo: Repository<Deck>,
  ) {}

  create(userId: string, dto: CreateDeckDto): Promise<Deck> {
    const deck = this.repo.create({
      ...dto,
      description: dto.description ?? null,
      userId,
    });
    return this.repo.save(deck);
  }

  findAll(userId: string): Promise<Deck[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(userId: string, id: string): Promise<Deck> {
    return this.findOwned(userId, id, { withCards: true });
  }

  async update(userId: string, id: string, dto: UpdateDeckDto): Promise<Deck> {
    const deck = await this.findOwned(userId, id);
    Object.assign(deck, dto);
    return this.repo.save(deck);
  }

  async remove(userId: string, id: string): Promise<void> {
    const deck = await this.findOwned(userId, id);
    await this.repo.remove(deck);
  }

  async findOwned(
    userId: string,
    id: string,
    options: { withCards?: boolean } = {},
  ): Promise<Deck> {
    const deck = await this.repo.findOne({
      where: { id },
      relations: options.withCards ? { cards: true } : undefined,
    });
    if (!deck) throw new NotFoundException('Deck not found');
    if (deck.userId !== userId) throw new ForbiddenException();
    return deck;
  }
}
