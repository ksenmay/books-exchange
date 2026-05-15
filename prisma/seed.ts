import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Очистка таблиц (все в lowercase)
    await prisma.$executeRaw`truncate table exchanges restart identity cascade`;
    await prisma.$executeRaw`truncate table favorites restart identity cascade`;
    await prisma.$executeRaw`truncate table quotes restart identity cascade`;
    await prisma.$executeRaw`truncate table reviews restart identity cascade`;
    await prisma.$executeRaw`truncate table books restart identity cascade`;
    await prisma.$executeRaw`truncate table userinfo restart identity cascade`;
    await prisma.$executeRaw`truncate table users restart identity cascade`;

    // 1. Users (3 записи)
    await prisma.users.createMany({
      data: [
        { username: 'admin1', password: 'hash_admin' },
        { username: 'alice_lidell', password: 'hash_alice' },
        { username: 'penelope_eckhart', password: 'hash_penelope' },
      ],
    });

    // Получаем ID пользователей
    const users = await prisma.users.findMany();

    // 2. UserInfo (3 записи) - все поля в lowercase
    await prisma.userinfo.createMany({
      data: [
        { userid: users[0].id, role: 'admin', email: 'admin@example.com', fullname: 'Администратор', location: 'Беларусь Витебск', avatarurl: 'https://example.com/avatar_admin.png', rating: 4.9 },
        { userid: users[1].id, role: 'default_user', email: 'alice@example.com', fullname: 'Алиса Лиделл', location: 'Беларусь Витебск', avatarurl: 'https://example.com/avatar_alice.png', rating: 4.5 },
        { userid: users[2].id, role: 'default_user', email: 'penelope@example.com', fullname: 'Пенелопа Экхарт', location: 'Беларусь Витебск', avatarurl: 'https://example.com/avatar_penelope.png', rating: 4.0 },
      ],
    });

    // 3. Books (3 записи) - все поля в lowercase
    await prisma.books.createMany({
      data: [
        { title: 'Преступление и наказание', ownerid: users[1].id, authorsnames: 'Фёдор Достоевский', description: 'Психологический роман о моральных дилеммах', genre: 'Роман', condition: 'medium', price: 350.0 },
        { title: 'Идиот', ownerid: users[1].id, authorsnames: 'Фёдор Достоевский', description: 'Роман о чистом и добром человеке', genre: 'Роман', condition: 'old', price: 250.0 },
        { title: 'Война и мир', ownerid: users[2].id, authorsnames: 'Лев Толстой', description: 'Эпический роман о войне 1812 года', genre: 'Роман', condition: 'medium', price: 500.0 },
      ],
    });

    const books = await prisma.books.findMany();

    // 4. Reviews (3 записи) - все поля в lowercase
    await prisma.reviews.createMany({
      data: [
        { userid: users[1].id, bookid: books[0].id, rating: 5, description: 'Отличная книга, глубокая психология' },
        { userid: users[2].id, bookid: books[1].id, rating: 4, description: 'Интересно, но тяжело читать' },
        { userid: users[0].id, bookid: books[2].id, rating: 5, description: 'Шедевр мировой литературы' },
      ],
    });

    // 5. Quotes (3 записи) - все поля в lowercase
    await prisma.quotes.createMany({
      data: [
        { userid: users[1].id, bookid: books[0].id, text: 'Тварь ли я дрожащая или право имею' },
        { userid: users[2].id, bookid: books[1].id, text: 'Красота спасет мир' },
        { userid: users[0].id, bookid: books[2].id, text: 'Война не любезность, а самое гадкое дело в жизни' },
      ],
    });

    // 6. Favorites (3 записи) - все поля в lowercase
    await prisma.favorites.createMany({
      data: [
        { userid: users[1].id, bookid: books[0].id },
        { userid: users[1].id, bookid: books[2].id },
        { userid: users[2].id, bookid: books[1].id },
      ],
    });

    // 7. Exchanges (3 записи) - все поля в lowercase
    await prisma.exchanges.createMany({
      data: [
        { operationtype: 'sale', senderid: users[1].id, receiverid: users[2].id, status: 'completed', bookid: books[0].id },
        { operationtype: 'exchange', senderid: users[2].id, receiverid: users[1].id, status: 'pending', bookid: books[2].id },
        { operationtype: 'sale', senderid: users[0].id, receiverid: users[1].id, status: 'approved', bookid: books[1].id },
      ],
    });

    console.log('База данных заполнена!');
    console.log(`Пользователей: ${await prisma.users.count()}`);
    console.log(`Книг: ${await prisma.books.count()}`);

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();