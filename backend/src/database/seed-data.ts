export const SEED_PASSWORD = 'Password123!';

export type SeedUser = {
  username: string;
  email: string;
  bio: string;
};

export const SEED_USERS: SeedUser[] = [
  {
    username: 'alice',
    email: 'alice@example.com',
    bio: 'Full-stack dev building a Twitter clone.',
  },
  {
    username: 'bob',
    email: 'bob@example.com',
    bio: 'Coffee, code, and cron jobs.',
  },
  {
    username: 'carol',
    email: 'carol@example.com',
    bio: 'Design systems and dark mode enthusiast.',
  },
  {
    username: 'dave',
    email: 'dave@example.com',
    bio: 'Backend engineer. Postgres enjoyer.',
  },
  {
    username: 'eve',
    email: 'eve@example.com',
    bio: 'QA by day, gamer by night.',
  },
  {
    username: 'frank',
    email: 'frank@example.com',
    bio: 'DevOps and docker-compose fan.',
  },
  {
    username: 'grace',
    email: 'grace@example.com',
    bio: 'Product-minded engineer.',
  },
  {
    username: 'heidi',
    email: 'heidi@example.com',
    bio: 'Mobile-first everything.',
  },
  {
    username: 'ivan',
    email: 'ivan@example.com',
    bio: 'Open source contributor.',
  },
  {
    username: 'judy',
    email: 'judy@example.com',
    bio: 'Data viz and timelines.',
  },
  {
    username: 'karl',
    email: 'karl@example.com',
    bio: 'NestJS + TypeORM daily driver.',
  },
  {
    username: 'laura',
    email: 'laura@example.com',
    bio: 'React hooks and good UX.',
  },
];

/** [followerUsername, followingUsername] */
export const SEED_FOLLOWS: [string, string][] = [
  ['alice', 'bob'],
  ['alice', 'carol'],
  ['alice', 'dave'],
  ['bob', 'alice'],
  ['bob', 'carol'],
  ['bob', 'eve'],
  ['carol', 'alice'],
  ['carol', 'grace'],
  ['dave', 'bob'],
  ['dave', 'frank'],
  ['eve', 'alice'],
  ['eve', 'heidi'],
  ['frank', 'grace'],
  ['frank', 'ivan'],
  ['grace', 'alice'],
  ['grace', 'judy'],
  ['heidi', 'carol'],
  ['heidi', 'laura'],
  ['ivan', 'dave'],
  ['ivan', 'karl'],
  ['judy', 'bob'],
  ['judy', 'eve'],
  ['karl', 'alice'],
  ['karl', 'frank'],
  ['laura', 'grace'],
  ['laura', 'heidi'],
];

export const SEED_TWEETS: Record<string, string[]> = {
  alice: [
    'Hello Flock! Starting my Twitter clone challenge.',
    'Timeline with cursor pagination is live.',
  ],
  bob: ['Morning deploy ☕', 'Who else is seeding Postgres today?'],
  carol: ['New avatar, who dis?', 'Design tokens > magic numbers.'],
  dave: [
    'Indexes on (authorId, createdAt) save the day.',
    'Never trust N+1 queries.',
  ],
  eve: ['Found a bug, wrote a test, fixed a bug.', 'Ship it Friday? Maybe.'],
  frank: ['docker compose up -d && happiness', 'CI green = good day.'],
  grace: ['User research notes incoming.', 'Small PRs review faster.'],
  heidi: ['Mobile layout first, desktop second.', 'Tap targets matter.'],
  ivan: ['Pushed a patch release.', 'Thanks contributors!'],
  judy: ['Charting follower growth.', 'Feeds are graphs in disguise.'],
  karl: ['Nest modules are neat.', 'TypeORM migrations FTW.'],
  laura: ['Infinite scroll feels buttery.', 'Accessibility is not optional.'],
};

/** [likerUsername, authorUsername, tweetIndexInAuthorList] */
export const SEED_LIKES: [string, string, number][] = [
  ['bob', 'alice', 0],
  ['carol', 'alice', 0],
  ['dave', 'alice', 1],
  ['eve', 'alice', 0],
  ['alice', 'bob', 0],
  ['carol', 'bob', 1],
  ['frank', 'bob', 0],
  ['alice', 'carol', 0],
  ['grace', 'carol', 1],
  ['bob', 'dave', 0],
  ['ivan', 'dave', 1],
  ['alice', 'eve', 0],
  ['heidi', 'eve', 0],
  ['grace', 'frank', 0],
  ['karl', 'frank', 0],
  ['alice', 'grace', 0],
  ['judy', 'grace', 1],
  ['carol', 'heidi', 0],
  ['laura', 'heidi', 0],
  ['dave', 'ivan', 0],
  ['frank', 'ivan', 0],
  ['bob', 'judy', 0],
  ['eve', 'judy', 1],
  ['alice', 'karl', 0],
  ['ivan', 'karl', 1],
  ['grace', 'laura', 0],
  ['heidi', 'laura', 1],
];
