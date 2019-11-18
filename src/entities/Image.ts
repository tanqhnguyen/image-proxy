import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Image {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  mime: string;

  @Column({ nullable: false })
  ext: string;

  @Column({ nullable: false })
  size: number;

  @Column({ type: 'bytea', nullable: false })
  content: Buffer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
