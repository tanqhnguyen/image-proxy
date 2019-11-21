import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

import { File } from './File';

@Entity()
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => File,
    file => file.links,
  )
  file: File;

  @Column({ type: 'timestamptz' })
  expiredAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
