import { DataSource, DataSourceOptions } from 'typeorm';

const getDbName = (env: string) => {
  switch (env) {
    case 'development':
      return 'db.sqlite';
    case 'test':
      return 'test.sqlite';
    case 'production':
      break;
    default:
      throw new Error('unknown environment');
  }
};

export const dataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  synchronize: false,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  database: getDbName(process.env.NODE_ENV),
  migrations: ['dist/db/migrations/*.js'],
  migrationsRun: process.env.NODE_ENV === 'test' ? true : false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
