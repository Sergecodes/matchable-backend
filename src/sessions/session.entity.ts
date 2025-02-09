import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // e.g., "padel", "fitness", or "tennis"

  @Column()
  timeSlot: string; // e.g., "09:00-09:45"

  @Column()
  duration: number; // calculated duration in minutes

  @Column()
  trainer: string;

  @Column('decimal')
  price: number;

  @Column({ default: true })
  available: boolean;

  @Column({ type: 'date' })
  date: string; // Format: "YYYY-MM-DD"
}
