import * as migration_20261119_100718_featured_repos from './20261119_100718_featured_repos';

export const migrations = [
  {
    up: migration_20261119_100718_featured_repos.up,
    down: migration_20261119_100718_featured_repos.down,
    name: '20261119_100718_featured_repos'
  },
];
