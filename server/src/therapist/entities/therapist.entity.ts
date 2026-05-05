import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Therapist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column({ type: 'int' })
  experience: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  voiceIntro: string;

  @Column({ nullable: true })
  nextAvailableSlot: Date;
}
