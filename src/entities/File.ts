import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Link } from './Link';

@Entity()
export class File {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  url: string;

  @Column({ nullable: false })
  mime: string;

  @Column({ nullable: false })
  ext: string;

  @Column({ nullable: false })
  size: number;

  @Column({ type: 'bytea', nullable: false })
  content: Buffer;

  @OneToMany(
    () => Link,
    link => link.file,
  )
  links: Link[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
