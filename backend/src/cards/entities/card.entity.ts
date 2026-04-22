import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deck } from '../../decks/entities/deck.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  front!: string;

  @Column({ type: 'text' })
  back!: string;

  @Column({ nullable: true, type: 'text' })
  example!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Deck, (deck) => deck.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deckId' })
  deck!: Deck;

  @Column()
  deckId!: string;
}
