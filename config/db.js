import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
    }
);

try {
    await sequelize.authenticate();
    console.log('Berhasil terhubung ke database MySQL Grand CEO Hotel dengan Sequelize!');
} catch (error) {
    console.error('Koneksi ke MySQL gagal:', error.message);
}

export default sequelize;