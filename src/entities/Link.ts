import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

import { Image } from './Image';

@Entity()
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Image,
    image => image.links,
  )
  image: Image;

  @Column({ type: 'timestamptz' })
  expiredAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
