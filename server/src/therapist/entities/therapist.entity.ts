import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Therapist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column({ type: 'int', default: 0 })
  hours: number;

  @Column({ type: 'int', default: 1 })
  group: number;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column()
  price: string;

  @Column()
  slot: string;

  @Column()
  img: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ nullable: true, type: 'varchar' })
  voiceIntro: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  nextAvailableSlot: Date | null;
}
