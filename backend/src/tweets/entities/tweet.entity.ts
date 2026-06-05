import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Like } from './like.entity';

@Entity('tweets')
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 280 })
  content: string;

  @Column()
  authorId: string;

  @ManyToOne(() => User, (user) => user.tweets, { onDelete: 'CASCADE' })
  author: User;

  @OneToMany(() => Like, (like) => like.tweet)
  likes: Like[];

  @Column({ type: 'uuid', nullable: true })
  parentTweetId: string | null;

  @ManyToOne(() => Tweet, (tweet) => tweet.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentTweetId' })
  parent: Tweet | null;

  @OneToMany(() => Tweet, (tweet) => tweet.parent)
  replies: Tweet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
