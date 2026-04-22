import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Deck } from '../../decks/entities/deck.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @Column({ nullable: true, type: 'varchar' })
  name!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Deck, (deck) => deck.user)
  decks!: Deck[];
}
