import { DataSource, DataSourceOptions } from 'typeorm';

const getDbConfig = (env: string): DataSourceOptions => {
  switch (env) {
    case 'development':
      return {
        type: 'sqlite',
        synchronize: false,
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        database: 'db.sqlite',
        migrations: ['dist/db/migrations/*.js'],
      };
    case 'test':
      return {
        type: 'sqlite',
        synchronize: false,
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        database: 'test.sqlite',
        migrations: ['dist/db/migrations/*.js'],
        migrationsRun: true,
      };
    case 'production':
      return {
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        migrations: ['dist/db/migrations/*.js'],
        migrationsRun: true,
        logging: ['query', 'info'],
      };
    default:
      throw new Error('unknown environment');
  }
};

export const dataSourceOptions: DataSourceOptions = getDbConfig(
  process.env.NODE_ENV,
);

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
