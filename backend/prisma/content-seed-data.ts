import { PrismaClient } from '@prisma/client';
import {
  CONTENT_ENTITY_TYPE,
  CONTENT_PAGES,
  CONTENT_LOCALES,
} from '../src/content/content-pages.manifest';

type LocaleValues = Record<string, string>;

const ABOUT: Record<(typeof CONTENT_LOCALES)[number], LocaleValues> = {
  en: {
    title: 'About Dog Rescue',
    subtitle:
      'We are a volunteer-driven group helping street dogs in Thailand find safety, care, and permanent homes.',
    missionTitle: 'Our mission',
    missionBody:
      'Every dog deserves food, medical care, and a chance at a stable life. We respond to reports from the community, coordinate rescue and treatment, and work with foster homes and adopters to give dogs a future off the street.',
    workTitle: 'What we do',
    workItem1: 'Rescue and emergency care for dogs reported by the public.',
    workItem2: 'Foster care, vaccinations, and rehabilitation before adoption.',
    workItem3:
      'Community reports on found and lost dogs, shared on our map after review.',
    helpTitle: 'How you can help',
    helpBody:
      'Donations fund food and vet bills. Sharing found-dog reports helps us act quickly. Adopting or fostering frees space for the next rescue.',
    ctaDonate: 'Donate',
    ctaDogs: 'Meet our dogs',
    ctaFound: 'Report a found dog',
  },
  th: {
    title: 'เกี่ยวกับ Dog Rescue',
    subtitle:
      'เราคือกลุ่มอาสาสมัครที่ช่วยสุนัขจรจัดในไทยให้ได้รับความปลอดภัย การดูแล และบ้านที่มั่นคง',
    missionTitle: 'พันธกิจของเรา',
    missionBody:
      'สุนัขทุกตัวสมควรได้รับอาหาร การรักษา และโอกาสในชีวิตที่มั่นคง เรารับแจ้งจากชุมชน ประสานการช่วยเหลือและรักษา และทำงานกับบ้านอุปการะและผู้รับเลี้ยงเพื่อให้สุนัขมีอนาคตนอกถนน',
    workTitle: 'สิ่งที่เราทำ',
    workItem1: 'ช่วยเหลือและดูแลฉุกเฉินจากรายงานของประชาชน',
    workItem2: 'บ้านอุปการะ วัคซีน และฟื้นฟูก่อนรับเลี้ยง',
    workItem3: 'รายงานสุนัขที่พบและหาย — แสดงบนแผนที่หลังตรวจสอบ',
    helpTitle: 'คุณช่วยได้อย่างไร',
    helpBody:
      'การบริจาคสนับสนุนอาหารและค่ารักษา การแจ้งพบสุนัขช่วยให้เราตอบสนองได้เร็ว การรับเลี้ยงหรืออุปการะช่วยเปิดที่สำหรับช่วยเหลือครั้งต่อไป',
    ctaDonate: 'บริจาค',
    ctaDogs: 'สุนัขของเรา',
    ctaFound: 'แจ้งพบสุนัข',
  },
  ru: {
    title: 'О Dog Rescue',
    subtitle:
      'Мы — волонтёрская команда, которая помогает уличным собакам в Таиланде обрести безопасность, лечение и дом.',
    missionTitle: 'Наша миссия',
    missionBody:
      'Каждая собака заслуживает еду, медицинскую помощь и шанс на спокойную жизнь. Мы реагируем на сообщения от людей, организуем спасение и лечение и работаем с передержками и усыновителями, чтобы у собак было будущее вне улицы.',
    workTitle: 'Чем мы занимаемся',
    workItem1: 'Спасение и экстренная помощь по сообщениям от сообщества.',
    workItem2: 'Передержка, вакцинация и реабилитация перед усыновлением.',
    workItem3:
      'Сообщения о найденных и потерянных собаках — на карте после модерации.',
    helpTitle: 'Как помочь',
    helpBody:
      'Пожертвования идут на корм и ветеринарию. Сообщения о найденных собаках помогают реагировать быстрее. Усыновление или передержка освобождает место для следующего спасения.',
    ctaDonate: 'Пожертвовать',
    ctaDogs: 'Наши собаки',
    ctaFound: 'Сообщить о найденной',
  },
};

const CONTACT: Record<(typeof CONTENT_LOCALES)[number], LocaleValues> = {
  en: {
    title: 'Contact us',
    subtitle:
      'Questions about adoption, volunteering, or partnerships? Reach out — we read every message.',
    reachTitle: 'Get in touch',
    emailLabel: 'Email',
    emailValue: 'hello@dogerescue.org',
    phoneLabel: 'Phone',
    phoneValue: '+66 80 000 0000',
    lineLabel: 'LINE',
    lineValue: '@dogerescue (placeholder)',
    socialTitle: 'Social media',
    facebookLabel: 'Facebook',
    facebookUrl: '',
    instagramLabel: 'Instagram',
    instagramUrl: '',
    telegramLabel: 'Telegram',
    telegramUrl: '',
    hoursTitle: 'Response hours',
    hoursBody:
      'We are volunteers and reply as soon as we can, usually within 1–2 business days. English and Thai supported.',
    addressTitle: 'Location',
    addressBody: 'Bangkok, Thailand\n(Office visits by appointment only)',
    noteBody:
      'If you see a dog that needs urgent help right now, please use the found-dog report — it reaches our on-call volunteers faster than email.',
    ctaFound: 'Report a found dog',
  },
  th: {
    title: 'ติดต่อเรา',
    subtitle:
      'มีคำถามเรื่องรับเลี้ยง อาสาสมัคร หรือความร่วมมือ? ติดต่อได้ — เราอ่านทุกข้อความ',
    reachTitle: 'ช่องทางติดต่อ',
    emailLabel: 'อีเมล',
    emailValue: 'hello@dogerescue.org',
    phoneLabel: 'โทรศัพท์',
    phoneValue: '+66 80 000 0000',
    lineLabel: 'LINE',
    lineValue: '@dogerescue (placeholder)',
    socialTitle: 'โซเชียลมีเดีย',
    facebookLabel: 'Facebook',
    facebookUrl: '',
    instagramLabel: 'Instagram',
    instagramUrl: '',
    telegramLabel: 'Telegram',
    telegramUrl: '',
    hoursTitle: 'เวลาตอบกลับ',
    hoursBody:
      'เราเป็นอาสาสมัครและตอบกลับโดยเร็วที่สุด โดยปกติภายใน 1–2 วันทำการ รองรับภาษาอังกฤษและไทย',
    addressTitle: 'ที่ตั้ง',
    addressBody: 'กรุงเทพฯ ประเทศไทย\n(เยี่ยมชมสำนักงานต้องนัดหมายล่วงหน้า)',
    noteBody:
      'หากพบสุนัขที่ต้องการความช่วยเหลือด่วน กรุณาใช้แบบฟอร์มแจ้งพบสุนัข — ถึงทีมเวรเร็วกว่าอีเมล',
    ctaFound: 'แจ้งพบสุนัข',
  },
  ru: {
    title: 'Контакты',
    subtitle:
      'Вопросы об усыновлении, волонтёрстве или сотрудничестве? Напишите — мы читаем все сообщения.',
    reachTitle: 'Связаться с нами',
    emailLabel: 'Email',
    emailValue: 'hello@dogerescue.org',
    phoneLabel: 'Телефон',
    phoneValue: '+66 80 000 0000',
    lineLabel: 'LINE',
    lineValue: '@dogerescue (placeholder)',
    socialTitle: 'Соцсети',
    facebookLabel: 'Facebook',
    facebookUrl: '',
    instagramLabel: 'Instagram',
    instagramUrl: '',
    telegramLabel: 'Telegram',
    telegramUrl: '',
    hoursTitle: 'Часы ответа',
    hoursBody:
      'Мы волонтёры и отвечаем, как только можем — обычно в течение 1–2 рабочих дней. Поддерживаем английский и тайский.',
    addressTitle: 'Адрес',
    addressBody: 'Бангкок, Таиланд\n(Визиты только по договорённости)',
    noteBody:
      'Если собаке нужна срочная помощь, используйте форму «найдена собака» — она быстрее доходит до дежурных волонтёров, чем email.',
    ctaFound: 'Сообщить о найденной собаке',
  },
};

const STORIES: Record<(typeof CONTENT_LOCALES)[number], LocaleValues> = {
  en: {
    title: 'Rescue stories',
    subtitle:
      'Real dogs, real rescues — and the community that made a difference.',
    ctaDonate: 'Support our work',
    ctaDogs: 'Meet our dogs',
  },
  th: {
    title: 'เรื่องราวการช่วยเหลือ',
    subtitle:
      'สุนัขจริง การช่วยเหลือจริง — และชุมชนที่ช่วยให้เกิดความเปลี่ยนแปลง',
    ctaDonate: 'สนับสนุนงานของเรา',
    ctaDogs: 'สุนัขของเรา',
  },
  ru: {
    title: 'Истории спасения',
    subtitle:
      'Настоящие собаки, настоящие спасения — и сообщество, которое помогло.',
    ctaDonate: 'Поддержать нас',
    ctaDogs: 'Наши собаки',
  },
};

const DONATE_BANK: Record<(typeof CONTENT_LOCALES)[number], LocaleValues> = {
  en: {
    bankAccountName: 'Account name: Dog Rescue Foundation',
    bankName: 'Bank: Example Bank (Thailand)',
    bankAccountNumber: 'Account number: 123-456-7890',
    bankNote:
      'Please include your name in the transfer reference if you want a thank-you note.',
  },
  th: {
    bankAccountName: 'ชื่อบัญชี: Dog Rescue Foundation',
    bankName: 'ธนาคาร: Example Bank (Thailand)',
    bankAccountNumber: 'เลขบัญชี: 123-456-7890',
    bankNote:
      'โปรดระบุชื่อในรายการโอน หากต้องการรับข้อความขอบคุณ',
  },
  ru: {
    bankAccountName: 'Получатель: Dog Rescue Foundation',
    bankName: 'Банк: Example Bank (Thailand)',
    bankAccountNumber: 'Счёт: 123-456-7890',
    bankNote:
      'Укажите имя в назначении платежа, если хотите получить благодарность.',
  },
};

const HOME_STATS_DEFAULTS = {
  statsSectionEnabled: 'true',
  statLabel: '',
} as const;

const HOME_STAT_LABELS: Record<(typeof CONTENT_LOCALES)[number], string> = {
  en: 'Dogs we\'ve rescued',
  th: 'สุนัขที่เราช่วยเหลือ',
  ru: 'Собак мы спасли',
};

const HOME: Record<(typeof CONTENT_LOCALES)[number], LocaleValues> = {
  en: {
    heroTitle: 'Help dogs find a home',
    heroSubtitle:
      'Report a found dog, adopt, volunteer, or donate — every action matters.',
    helpButton: 'Donate',
    findDogButton: 'Find a dog',
    reportFoundButton: 'Report a found dog',
    ...HOME_STATS_DEFAULTS,
    statLabel: HOME_STAT_LABELS.en,
  },
  th: {
    heroTitle: 'ช่วยสุนัขหาบ้าน',
    heroSubtitle:
      'แจ้งพบสุนัข รับเลี้ยง เป็นอาสา หรือบริจาค — ทุกความช่วยเหลือมีความหมาย',
    helpButton: 'บริจาค',
    findDogButton: 'หาสุนัข',
    reportFoundButton: 'แจ้งพบสุนัข',
    ...HOME_STATS_DEFAULTS,
    statLabel: HOME_STAT_LABELS.th,
  },
  ru: {
    heroTitle: 'Помогите собакам найти дом',
    heroSubtitle:
      'Сообщите о найденной собаке, возьмите из приюта, станьте волонтёром или поддержите нас — каждый шаг важен.',
    helpButton: 'Пожертвовать',
    findDogButton: 'Найти собаку',
    reportFoundButton: 'Сообщить о найденной',
    ...HOME_STATS_DEFAULTS,
    statLabel: HOME_STAT_LABELS.ru,
  },
};

const FAQ: Record<(typeof CONTENT_LOCALES)[number], LocaleValues> = {
  en: {
    title: 'Frequently asked questions',
    subtitle: 'Quick answers about adoption, reporting, donations, and volunteering.',
    faq1Question: 'How do I adopt a dog?',
    faq1Answer:
      'Browse our dogs page, read the profiles, and contact us by email. We will guide you through a short conversation and, if needed, a meet-and-greet with foster volunteers.',
    faq2Question: 'How do I report a found dog?',
    faq2Answer:
      'Use the found-dog form with a photo and location if you can. Urgent cases reach our on-call volunteers faster than email. Approved reports may appear on the public map.',
    faq3Question: 'Where do donations go?',
    faq3Answer:
      'Donations fund food, vaccinations, emergency vet care, and foster support. Bank and crypto options are on the donate page. You can submit a donation report after you pay.',
    faq4Question: 'Can I help without adopting?',
    faq4Answer:
      'Yes — fostering, sharing reports, translating messages, and one-off transport help are all valuable. Email us to discuss what fits your schedule.',
    faq5Question: 'How fast do you reply?',
    faq5Answer:
      'We are volunteers and usually respond within 1–2 business days. For urgent street cases, use the found-dog report rather than waiting for email.',
    ctaContact: 'Still have questions? Contact us',
  },
  th: {
    title: 'คำถามที่พบบ่อย',
    subtitle:
      'คำตอบสั้น ๆ เรื่องรับเลี้ยง การแจ้งพบ การบริจาค และการเป็นอาสา',
    faq1Question: 'จะรับเลี้ยงสุนัขได้อย่างไร?',
    faq1Answer:
      'ดูหน้าสุนัขของเรา อ่านโปรไฟล์ แล้วติดต่อทางอีเมล เราจะคุยสั้น ๆ และนัดพบกับอาสาอุปการะหากจำเป็น',
    faq2Question: 'จะแจ้งพบสุนัขได้อย่างไร?',
    faq2Answer:
      'ใช้แบบฟอร์มแจ้งพบพร้อมรูปและตำแหน่งถ้าเป็นไปได้ กรณีเร่งด่วนถึงทีมเวรเร็วกว่าอีเมล รายงานที่อนุมัติแล้วอาจแสดงบนแผนที่สาธารณะ',
    faq3Question: 'เงินบริจาคไปที่ไหน?',
    faq3Answer:
      'ใช้กับอาหาร วัคซีน ค่ารักษาเร่งด่วน และการดูแลในอุปการะ ดูหน้าบริจาคสำหรับโอนธนาคารและคริปโต หลังโอนแล้วส่งรายงานการบริจาคได้',
    faq4Question: 'ช่วยได้โดยไม่รับเลี้ยงไหม?',
    faq4Answer:
      'ได้ — อุปการะ แชร์รายงาน แปลข้อความ หรือช่วยขนส่งครั้งคราวมีคุณค่า อีเมลมาคุยว่าเหมาะกับเวลาของคุณอย่างไร',
    faq5Question: 'ตอบกลับเร็วแค่ไหน?',
    faq5Answer:
      'เราเป็นอาสาและมักตอบภายใน 1–2 วันทำการ กรณีเร่งด่วนบนถนน ใช้แบบฟอร์มแจ้งพบแทนการรออีเมล',
    ctaContact: 'ยังมีคำถาม? ติดต่อเรา',
  },
  ru: {
    title: 'Частые вопросы',
    subtitle:
      'Коротко об усыновлении, сообщениях о найденных, пожертвованиях и волонтёрстве.',
    faq1Question: 'Как усыновить собаку?',
    faq1Answer:
      'Посмотрите каталог, прочитайте профили и напишите нам на email. Мы коротко обсудим детали и при необходимости организуем встречу с передержкой.',
    faq2Question: 'Как сообщить о найденной собаке?',
    faq2Answer:
      'Заполните форму «найдена собака» с фото и местом, если можете. Срочные случаи быстрее доходят до дежурных, чем email. Одобренные отчёты могут появиться на карте.',
    faq3Question: 'Куда идут пожертвования?',
    faq3Answer:
      'На корм, вакцины, экстренную ветпомощь и передержки. На странице donate — банк и крипто. После перевода можно отправить отчёт о пожертвовании.',
    faq4Question: 'Можно помочь без усыновления?',
    faq4Answer:
      'Да — передержка, репосты, перевод сообщений и разовая помощь с перевозкой важны. Напишите на email, обсудим формат.',
    faq5Question: 'Как быстро вы отвечаете?',
    faq5Answer:
      'Мы волонтёры и обычно отвечаем за 1–2 рабочих дня. Для срочных случаев на улице используйте форму found-dog, а не ждите email.',
    ctaContact: 'Остались вопросы? Напишите нам',
  },
};

export const CONTENT_SEED_BY_PAGE: Record<
  string,
  Record<(typeof CONTENT_LOCALES)[number], LocaleValues>
> = {
  home: HOME,
  faq: FAQ,
  about: ABOUT,
  contact: CONTACT,
  stories: STORIES,
  'donate-bank': DONATE_BANK,
};

export async function seedContentTranslations(prisma: PrismaClient): Promise<void> {
  let count = 0;

  for (const page of CONTENT_PAGES) {
    const localeMap = CONTENT_SEED_BY_PAGE[page.id];
    if (!localeMap) {
      continue;
    }

    for (const locale of CONTENT_LOCALES) {
      const values = localeMap[locale];
      for (const field of page.fields) {
        const value = values[field];
        if (value === undefined) {
          continue;
        }

        await prisma.contentTranslation.upsert({
          where: {
            entityType_entityId_locale_field: {
              entityType: CONTENT_ENTITY_TYPE,
              entityId: page.id,
              locale,
              field,
            },
          },
          create: {
            entityType: CONTENT_ENTITY_TYPE,
            entityId: page.id,
            locale,
            field,
            value,
          },
          update: {
            value,
          },
        });
        count += 1;
      }
    }
  }

  console.log(`Seeded/updated ${count} content translations`);
}
