import * as migration_20261119_100718_featured_repos from './20261119_100718_featured_repos';
import * as migration_20261119_170352_phase6_pipeline_and_audit from './20261119_170352_phase6_pipeline_and_audit';

export const migrations = [
  {
    up: migration_20261119_100718_featured_repos.up,
    down: migration_20261119_100718_featured_repos.down,
    name: '20261119_100718_featured_repos',
  },
  {
    up: migration_20261119_170352_phase6_pipeline_and_audit.up,
    down: migration_20261119_170352_phase6_pipeline_and_audit.down,
    name: '20261119_170352_phase6_pipeline_and_audit'
  },
];
