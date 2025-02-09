import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Session } from '../sessions/session.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientName: string;

  @Column()
  clientEmail: string;

  @Column()
  clientPhone: string;

  @ManyToMany(() => Session, { eager: true })
  @JoinTable() // creates a join table between Booking and Session
  sessions: Session[];

  @Column('decimal')
  totalCost: number;
}
