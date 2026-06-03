import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import dataSource from './data-source';
import {
  SEED_FOLLOWS,
  SEED_LIKES,
  SEED_PASSWORD,
  SEED_TWEETS,
  SEED_USERS,
} from './seed-data';
import { Follow } from '../follows/entities/follow.entity';
import { Like } from '../tweets/entities/like.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { User } from '../users/entities/user.entity';

const BCRYPT_ROUNDS = 12;

function avatarUrl(username: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;
}

async function seed() {
  await dataSource.initialize();
  await dataSource.runMigrations();

  console.log('Clearing existing data...');
  await dataSource.query(
    'TRUNCATE TABLE "refresh_tokens", "likes", "follows", "tweets", "users" RESTART IDENTITY CASCADE',
  );

  const userRepo = dataSource.getRepository(User);
  const tweetRepo = dataSource.getRepository(Tweet);
  const followRepo = dataSource.getRepository(Follow);
  const likeRepo = dataSource.getRepository(Like);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);
  const usersByUsername = new Map<string, User>();

  console.log(`Creating ${SEED_USERS.length} users...`);
  for (const seedUser of SEED_USERS) {
    const user = userRepo.create({
      email: seedUser.email,
      username: seedUser.username,
      passwordHash,
      bio: seedUser.bio,
      avatarUrl: avatarUrl(seedUser.username),
    });
    await userRepo.save(user);
    usersByUsername.set(seedUser.username, user);
  }

  const tweetsByAuthor = new Map<string, Tweet[]>();
  const baseTime = Date.now();

  console.log('Creating tweets...');
  let tweetOffset = 0;
  for (const [username, contents] of Object.entries(SEED_TWEETS)) {
    const author = usersByUsername.get(username);
    if (!author) continue;

    const authorTweets: Tweet[] = [];
    for (const content of contents) {
      const createdAt = new Date(baseTime - tweetOffset * 60_000);
      const tweet = tweetRepo.create({
        content,
        authorId: author.id,
        createdAt,
        updatedAt: createdAt,
      });
      await tweetRepo.save(tweet);
      authorTweets.push(tweet);
      tweetOffset += 1;
    }
    tweetsByAuthor.set(username, authorTweets);
  }

  console.log(`Creating ${SEED_FOLLOWS.length} follow relationships...`);
  for (const [followerName, followingName] of SEED_FOLLOWS) {
    const follower = usersByUsername.get(followerName);
    const following = usersByUsername.get(followingName);
    if (!follower || !following) continue;

    const follow = followRepo.create({
      followerId: follower.id,
      followingId: following.id,
    });
    await followRepo.save(follow);
  }

  console.log(`Creating ${SEED_LIKES.length} likes...`);
  for (const [likerName, authorName, tweetIndex] of SEED_LIKES) {
    const liker = usersByUsername.get(likerName);
    const authorTweets = tweetsByAuthor.get(authorName);
    const tweet = authorTweets?.[tweetIndex];
    if (!liker || !tweet) continue;

    const like = likeRepo.create({
      userId: liker.id,
      tweetId: tweet.id,
    });
    await likeRepo.save(like);
  }

  const tweetCount = [...tweetsByAuthor.values()].reduce(
    (sum, list) => sum + list.length,
    0,
  );

  console.log('\nSeed completed successfully.');
  console.log(`  Users:   ${SEED_USERS.length}`);
  console.log(`  Tweets:  ${tweetCount}`);
  console.log(`  Follows: ${SEED_FOLLOWS.length}`);
  console.log(`  Likes:   ${SEED_LIKES.length}`);
  console.log('\nTest credentials (all seed users share the same password):');
  console.log(`  Email:    alice@example.com`);
  console.log(`  Username: alice`);
  console.log(`  Password: ${SEED_PASSWORD}`);
  console.log(
    '\nOther users: bob@example.com, carol@example.com, ... (see seed-data.ts)',
  );

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
