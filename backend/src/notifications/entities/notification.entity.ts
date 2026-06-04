import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tweet } from '../../tweets/entities/tweet.entity';
import { User } from '../../users/entities/user.entity';
import { NotificationType } from './notification-type';

@Entity('notifications')
@Index(['recipientId', 'createdAt'])
@Index(['recipientId', 'readAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  recipient: User;

  @Column()
  actorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  actor: User;

  @Column({ type: 'varchar', length: 20 })
  type: NotificationType;

  @Column({ type: 'uuid', nullable: true })
  tweetId: string | null;

  @ManyToOne(() => Tweet, { onDelete: 'CASCADE', nullable: true })
  tweet: Tweet | null;

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
