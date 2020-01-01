import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { AccessToken } from './AccessToken';

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
    () => AccessToken,
    accessToken => accessToken.file,
  )
  accessTokens: AccessToken[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
