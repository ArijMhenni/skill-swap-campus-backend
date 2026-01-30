import { DataSource } from 'typeorm';
import { User } from './modules/users/entities/user.entity';
import { Skill } from './modules/skills/entities/skill.entity';
import { SkillRequest } from './modules/requests/entities/request-skill.entity';
import { Rating } from './modules/ratings/entities/rating.entity';
import { Message } from './modules/messages/entities/message.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import { Report } from './modules/admin/entities/report.entity';
import { Role } from './common/enums/role.enum';
import { SkillType } from './common/enums/skill-type.enum';
import { SkillCategory } from './common/enums/skill-category.enum';
import { SkillStatus } from './common/enums/skill-status.enum';
import { RequestStatus } from './common/enums/request-status.enum';
import { ReportTargetType } from './common/enums/report-target-type.enum';
import { ReportStatus } from './common/enums/report-status.enum';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [User, Skill, SkillRequest, Rating, Message, Notification, Report],
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const userRepo = AppDataSource.getRepository(User);
  const skillRepo = AppDataSource.getRepository(Skill);
  const requestRepo = AppDataSource.getRepository(SkillRequest);
  const ratingRepo = AppDataSource.getRepository(Rating);
  const messageRepo = AppDataSource.getRepository(Message);
  const notificationRepo = AppDataSource.getRepository(Notification);
  const reportRepo = AppDataSource.getRepository(Report);

  // Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = userRepo.create({
    email: 'admin@skillswap.com',
    password: passwordHash,
    firstName: 'Admin',
    lastName: 'User',
    role: Role.ADMIN,
    offeredSkills: [],
    wantedSkills: [],
  });

  const users = Array.from({ length: 5 }).map(() =>
    userRepo.create({
      email: faker.internet.email(),
      password: passwordHash,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: Role.USER,
      offeredSkills: [],
      wantedSkills: [],
    }),
  );

  await userRepo.save([admin, ...users]);
  console.log('✅ Users seeded');

  // Skills
  const allUsers = await userRepo.find();
  const skills = allUsers.flatMap((user) =>
    Array.from({ length: 3 }).map(() => {
      const type = faker.helpers.arrayElement([
        SkillType.OFFER,
        SkillType.REQUEST,
      ]);
      const title = `${faker.hacker.verb()} ${faker.hacker.noun()}`;
      const skill = skillRepo.create({
        title,
        description: faker.lorem.sentence(),
        category: faker.helpers.arrayElement(Object.values(SkillCategory)),
        type,
        estimatedTime: faker.number.int({ min: 1, max: 10 }),
        status: SkillStatus.ACTIVE,
        user,
      });

      if (type === SkillType.OFFER) user.offeredSkills.push(title);
      else user.wantedSkills.push(title);

      return skill;
    }),
  );

  await skillRepo.save(skills);
  await userRepo.save(allUsers); // Update offered/wanted skills
  console.log('✅ Skills seeded');

  // Skill Requests
  const allSkills = await skillRepo.find({ relations: ['user'] });
  const requests = allSkills
    .filter((s) => s.type === SkillType.OFFER)
    .map((skill) => {
      const requester = faker.helpers.arrayElement(
        allUsers.filter((u) => u.id !== skill.user.id),
      );
      return requestRepo.create({
        skillId: skill.id,
        skill,
        requesterId: requester.id,
        requester,
        providerId: skill.user.id,
        provider: skill.user,
        status: RequestStatus.PENDING,
        message: faker.lorem.sentence(),
      });
    });

  await requestRepo.save(requests);
  console.log('✅ SkillRequests seeded');

  // Ratings
  const ratings = requests
    .filter(() => faker.datatype.boolean())
    .map((request) => {
      const rater = request.requester;
      return ratingRepo.create({
        request,
        rater,
        ratedUser: request.provider,
        stars: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
      });
    });

  await ratingRepo.save(ratings);
  console.log('✅ Ratings seeded');

  // Messages
  const messages = requests.map((request) => {
    return messageRepo.create({
      request: request as any,
      sender: request.requester,
      content: faker.lorem.sentence(),
      isRead: false,
    });
  });

  await messageRepo.save(messages);
  console.log('✅ Messages seeded');

  // Notifications
  const notifications = allUsers.map((user) =>
    notificationRepo.create({
      userId: user.id,
      title: 'Welcome!',
      message: `Hello ${user.firstName}, welcome to SkillSwap Campus!`,
      isRead: false,
    }),
  );

  await notificationRepo.save(notifications);
  console.log('✅ Notifications seeded');

  // Reports
  const reports = allUsers
    .filter((u) => u.role === Role.USER)
    .map((user) =>
      reportRepo.create({
        reporter: faker.helpers.arrayElement(
          allUsers.filter((u) => u.id !== user.id),
        ),
        targetType: faker.helpers.arrayElement(Object.values(ReportTargetType)),
        targetId: faker.string.uuid(),
        reason: faker.lorem.sentence(),
        status: ReportStatus.PENDING,
      }),
    );

  await reportRepo.save(reports);
  console.log('✅ Reports seeded');

  console.log('🎉 Seeding finished!');
  await AppDataSource.destroy();
}

seed().catch((err) => console.error('❌ Seeding error:', err));
