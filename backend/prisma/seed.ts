import { PrismaClient, DogStatus, ReportStatus, UserRole, DonationStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedContentTranslations } from './content-seed-data';

const prisma = new PrismaClient();
const SYSTEM_USER_EMAIL = 'system@dogerescue.org';

const DEMO_DOGS = [
  {
    slug: 'luna',
    status: DogStatus.AVAILABLE,
    isPublished: true,
    descriptions: {
      en: {
        name: 'Luna',
        description: 'Friendly mixed-breed looking for a calm home.',
        rescueStory: 'Found near the temple, recovering well.',
      },
      th: {
        name: 'ลูน่า',
        description: 'สุนัขผสมที่เป็นมิตร กำลังมองหาบ้านที่เงียบสงบ',
      },
      ru: {
        name: 'Луна',
        description: 'Дружелюбная дворняшка ищет спокойный дом.',
      },
    },
    seo: {
      title: {
        en: 'Luna — adopt me',
        th: 'ลูน่า — รับเลี้ยง',
        ru: 'Луна — возьми меня домой',
      },
      description: {
        en: 'Meet Luna, available for adoption.',
      },
    },
  },
  {
    slug: 'mango',
    status: DogStatus.IN_CARE,
    isPublished: true,
    descriptions: {
      en: {
        name: 'Mango',
        description: 'Puppy in foster care, not ready for visits yet.',
        rescueStory: 'Rescued from the market with siblings.',
      },
      th: {
        name: 'มะม่วง',
        description: 'Puppy in temporary foster care.',
      },
    },
    seo: {
      title: { en: 'Mango — in care' },
      description: { en: 'Mango is recovering in foster care.' },
    },
  },
];

const SEED_FOUND_EMAIL = 'seed-found@dogerescue.org';
const SEED_LOST_EMAIL = 'seed-lost@dogerescue.org';
const SEED_MAP_FOUND_EMAIL = 'seed-map-found@dogerescue.org';
const SEED_MAP_LOST_EMAIL = 'seed-map-lost@dogerescue.org';

const DEMO_CRYPTO_ADDRESSES = [
  {
    currencyCode: 'BTC',
    label: 'Bitcoin',
    address: 'bc1qdogerescue-dev-only-btc0000000000',
  },
  {
    currencyCode: 'ETH',
    label: 'Ethereum',
    address: '0xDogerescueDevOnlyEthAddress0000000000000000',
  },
  {
    currencyCode: 'USDT',
    label: 'Tether (USDT)',
    address: 'TDOGERescueDevOnlyUsdtAddress000000000',
  },
  {
    currencyCode: 'DOGE',
    label: 'Dogecoin',
    address: 'DDOGERescueDevOnlyDogeAddress00000000',
  },
] as const;

const SEED_DONATION_CONFIRMED_EMAIL = 'seed-donation-confirmed@dogerescue.org';
const SEED_DONATION_PENDING_EMAIL = 'seed-donation-pending@dogerescue.org';

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@dogerescue.org';
  const password = process.env.ADMIN_PASSWORD ?? 'changeme-dev-only';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: UserRole.ADMIN },
    create: { email, passwordHash, role: UserRole.ADMIN },
  });

  console.log(`Seeded admin user: ${email}`);

  const staffEmail = process.env.STAFF_EMAIL ?? 'staff@dogerescue.org';
  const staffPassword = process.env.STAFF_PASSWORD ?? 'changeme-staff-dev';
  const staffHash = await bcrypt.hash(staffPassword, 10);

  await prisma.user.upsert({
    where: { email: staffEmail },
    update: { passwordHash: staffHash, role: UserRole.STAFF },
    create: {
      email: staffEmail,
      passwordHash: staffHash,
      role: UserRole.STAFF,
    },
  });

  console.log(`Seeded staff user: ${staffEmail}`);

  const systemHash = await bcrypt.hash('system-no-login', 10);
  await prisma.user.upsert({
    where: { email: SYSTEM_USER_EMAIL },
    update: { passwordHash: systemHash, role: UserRole.USER },
    create: {
      email: SYSTEM_USER_EMAIL,
      passwordHash: systemHash,
      role: UserRole.USER,
    },
  });

  console.log(`Seeded system user: ${SYSTEM_USER_EMAIL}`);

  for (const dog of DEMO_DOGS) {
    await prisma.dog.upsert({
      where: { slug: dog.slug },
      update: {
        status: dog.status,
        isPublished: dog.isPublished,
        descriptions: dog.descriptions,
        seo: dog.seo,
      },
      create: {
        slug: dog.slug,
        status: dog.status,
        isPublished: dog.isPublished,
        descriptions: dog.descriptions,
        seo: dog.seo,
      },
    });
    console.log(`Seeded dog: ${dog.slug}`);
  }

  const existingFound = await prisma.foundReport.findFirst({
    where: { reporterEmail: SEED_FOUND_EMAIL },
  });

  if (!existingFound) {
    await prisma.foundReport.create({
      data: {
        reporterName: 'Seed Found Reporter',
        reporterPhone: '+66800000001',
        reporterEmail: SEED_FOUND_EMAIL,
        description: 'Demo active found report for smoke tests.',
        status: ReportStatus.ACTIVE,
      },
    });
    console.log('Seeded active found report');
  }

  const existingLost = await prisma.lostReport.findFirst({
    where: { reporterEmail: SEED_LOST_EMAIL },
  });

  if (!existingLost) {
    await prisma.lostReport.create({
      data: {
        reporterName: 'Seed Lost Reporter',
        reporterPhone: '+66800000002',
        reporterEmail: SEED_LOST_EMAIL,
        description: 'Demo active lost report for smoke tests.',
        status: ReportStatus.ACTIVE,
      },
    });
    console.log('Seeded active lost report');
  }

  const existingMapFound = await prisma.foundReport.findFirst({
    where: { reporterEmail: SEED_MAP_FOUND_EMAIL },
  });

  if (!existingMapFound) {
    await prisma.foundReport.create({
      data: {
        reporterName: 'Seed Map Found',
        reporterPhone: '+66800000003',
        reporterEmail: SEED_MAP_FOUND_EMAIL,
        description: 'Demo found dog near Grand Palace area.',
        status: ReportStatus.VERIFIED,
        latitude: 13.7563,
        longitude: 100.5018,
      },
    });
    console.log('Seeded map found marker');
  } else {
    await prisma.foundReport.update({
      where: { id: existingMapFound.id },
      data: {
        status: ReportStatus.VERIFIED,
        latitude: 13.7563,
        longitude: 100.5018,
        description: 'Demo found dog near Grand Palace area.',
      },
    });
    console.log('Updated map found marker');
  }

  const existingMapLost = await prisma.lostReport.findFirst({
    where: { reporterEmail: SEED_MAP_LOST_EMAIL },
  });

  if (!existingMapLost) {
    await prisma.lostReport.create({
      data: {
        reporterName: 'Seed Map Lost',
        reporterPhone: '+66800000004',
        reporterEmail: SEED_MAP_LOST_EMAIL,
        description: 'Demo lost dog last seen near Lumphini Park.',
        status: ReportStatus.VERIFIED,
        latitude: 13.7465,
        longitude: 100.5347,
      },
    });
    console.log('Seeded map lost marker');
  } else {
    await prisma.lostReport.update({
      where: { id: existingMapLost.id },
      data: {
        status: ReportStatus.VERIFIED,
        latitude: 13.7465,
        longitude: 100.5347,
        description: 'Demo lost dog last seen near Lumphini Park.',
      },
    });
    console.log('Updated map lost marker');
  }

  const demoCurrencyCodes = DEMO_CRYPTO_ADDRESSES.map((item) => item.currencyCode);

  await prisma.cryptoAddress.deleteMany({
    where: { currencyCode: { notIn: [...demoCurrencyCodes] } },
  });

  for (const demo of DEMO_CRYPTO_ADDRESSES) {
    await prisma.cryptoAddress.deleteMany({
      where: {
        currencyCode: demo.currencyCode,
        address: { not: demo.address },
      },
    });

    const existing = await prisma.cryptoAddress.findFirst({
      where: { address: demo.address },
    });

    if (!existing) {
      await prisma.cryptoAddress.updateMany({
        where: { currencyCode: demo.currencyCode, isDisplayed: true },
        data: { isDisplayed: false },
      });
      await prisma.cryptoAddress.create({
        data: {
          currencyCode: demo.currencyCode,
          label: demo.label,
          address: demo.address,
          isActive: true,
          isDisplayed: true,
        },
      });
      console.log(`Seeded crypto address: ${demo.currencyCode}`);
    } else {
      await prisma.cryptoAddress.updateMany({
        where: {
          currencyCode: demo.currencyCode,
          isDisplayed: true,
          id: { not: existing.id },
        },
        data: { isDisplayed: false },
      });
      await prisma.cryptoAddress.update({
        where: { id: existing.id },
        data: {
          currencyCode: demo.currencyCode,
          label: demo.label,
          isActive: true,
          isDisplayed: true,
        },
      });
      console.log(`Updated crypto address: ${demo.currencyCode}`);
    }
  }

  const existingConfirmedDonation = await prisma.donation.findFirst({
    where: { donorEmail: SEED_DONATION_CONFIRMED_EMAIL },
  });

  if (!existingConfirmedDonation) {
    await prisma.donation.create({
      data: {
        amount: 1000,
        currency: 'THB',
        status: DonationStatus.CONFIRMED,
        paymentMethod: PaymentMethod.BANK,
        donorName: 'Seed Confirmed Donor',
        donorEmail: SEED_DONATION_CONFIRMED_EMAIL,
      },
    });
    console.log('Seeded confirmed donation');
  } else {
    await prisma.donation.update({
      where: { id: existingConfirmedDonation.id },
      data: {
        amount: 1000,
        status: DonationStatus.CONFIRMED,
        paymentMethod: PaymentMethod.BANK,
      },
    });
    console.log('Updated confirmed donation');
  }

  const existingPendingDonation = await prisma.donation.findFirst({
    where: { donorEmail: SEED_DONATION_PENDING_EMAIL },
  });

  if (!existingPendingDonation) {
    await prisma.donation.create({
      data: {
        amount: 500,
        currency: 'THB',
        status: DonationStatus.PENDING,
        paymentMethod: PaymentMethod.CRYPTO,
        donorName: 'Seed Pending Donor',
        donorEmail: SEED_DONATION_PENDING_EMAIL,
      },
    });
    console.log('Seeded pending donation');
  } else {
    await prisma.donation.update({
      where: { id: existingPendingDonation.id },
      data: {
        amount: 500,
        status: DonationStatus.PENDING,
        paymentMethod: PaymentMethod.CRYPTO,
      },
    });
    console.log('Updated pending donation');
  }

  await seedDemoStories();

  await seedContentTranslations(prisma);
}

async function seedDemoStories() {
  const luna = await prisma.dog.findUnique({ where: { slug: 'luna' } });
  const mango = await prisma.dog.findUnique({ where: { slug: 'mango' } });

  const stories = [
    {
      slug: 'luna-temple',
      dogId: luna?.id ?? null,
      content: {
        en: {
          title: 'Luna found peace near the temple',
          body: 'Luna was reported by a neighbor who saw her limping near a temple in Bangkok. Volunteers picked her up the same evening, treated a minor wound, and placed her in foster care. Today she is calm, healthy, and looking for a quiet home.',
        },
        th: {
          title: 'ลูน่าได้พบความสงบใกล้วัด',
          body: 'มีเพื่อนบ้านแจ้งว่าเห็นลูน่าเดินกะเผลกใกล้วัดในกรุงเทพฯ อาสาสมัครไปรับในคืนเดียวกัน รักษาแผลเล็กน้อย และส่งเข้าบ้านอุปการะ ตอนนี้เธอสงบ แข็งแรง และกำลังมองหาบ้านที่เงียบสงบ',
        },
        ru: {
          title: 'Луна обрела спокойствие у храма',
          body: 'Сосед сообщил, что видел Луну, хромающую у храма в Бангкоке. Волонтёры забрали её в тот же вечер, обработали небольшую рану и передали на передержку. Сейчас она спокойная, здоровая и ищет тихий дом.',
        },
      },
    },
    {
      slug: 'mango-siblings',
      dogId: mango?.id ?? null,
      content: {
        en: {
          title: 'Mango and her siblings',
          body: 'Mango was rescued from a market with her litter mates. Foster volunteers handled vaccinations and daily care while we waited for the right adopter. She is still in our program — recovering well and building confidence every week.',
        },
        th: {
          title: 'มะม่วงและพี่น้อง',
          body: 'มะม่วงถูกช่วยจากตลาดพร้อมลูกสุนัข อาสาดูแลวัคซีนและการดูแลประจำวันจนกว่าจะพบผู้รับเลี้ยงที่เหมาะสม ยังอยู่ในโครงการของเรา — ฟื้นตัวดีและมั่นใจขึ้นทุกสัปดาห์',
        },
        ru: {
          title: 'Манго и её сёстры',
          body: 'Манго спасли с рынка вместе с сородичами. Волонтёры на передержке занимались вакцинацией и ежедневным уходом, пока мы искали подходящего усыновителя. Она всё ещё у нас — хорошо восстанавливается и каждую неделю становится увереннее.',
        },
      },
    },
    {
      slug: 'timely-report',
      dogId: null,
      content: {
        en: {
          title: 'A report that reached us in time',
          body: 'Someone submitted a found-dog report with a photo and location. Because the message arrived quickly, we coordinated pickup before the dog wandered into traffic. That is why we ask the community to report what they see — it saves lives.',
        },
        th: {
          title: 'รายงานที่มาถึงเราทันเวลา',
          body: 'มีคนส่งรายงานพบสุนัขพร้อมรูปและตำแหน่ง เพราะข้อความมาเร็ว เราประสานรับสุนัขก่อนที่จะเดินเข้าไปในถนน นั่นคือเหตุผลที่เราขอให้ชุมชนแจ้งสิ่งที่เห็น — มันช่วยชีวิตได้',
        },
        ru: {
          title: 'Сообщение, которое успело вовремя',
          body: 'Кто-то отправил отчёт о найденной собаке с фото и местом. Сообщение пришло быстро — мы успели забрать собаку до того, как она вышла на проезжую часть. Поэтому мы просим сообщество рассказывать о том, что видят — это спасает жизни.',
        },
      },
    },
  ];

  const publishedAt = new Date('2026-01-15T10:00:00.000Z');

  for (const story of stories) {
    await prisma.story.upsert({
      where: { slug: story.slug },
      update: {
        content: story.content,
        isPublished: true,
        publishedAt,
        dogId: story.dogId,
      },
      create: {
        slug: story.slug,
        content: story.content,
        isPublished: true,
        publishedAt,
        dogId: story.dogId,
      },
    });
    console.log(`Seeded story: ${story.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
