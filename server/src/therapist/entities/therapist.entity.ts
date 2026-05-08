import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Therapist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column()
  experience: number;

  @Column()
  group: number;

  @Column()
  price: number;

  @Column({ nullable: true })
  couplePrice: number;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  voiceIntro: string;

  @Column({ nullable: true })
  qualifications: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  bio: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  nextAvailableSlot: Date;

  @Column({
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
