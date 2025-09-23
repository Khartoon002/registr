// prisma/seed.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const bot = await prisma.bot.upsert({
    where: { slug: 'magnus-assistant' },
    update: {},
    create: {
      title: 'Magnus Assistant',
      slug: 'magnus-assistant',
      welcomeMessage: 'Type ready to begin.',
      settings: JSON.stringify({
        themeDefault: 'whatsapp',
        lockUntilQuickForm: true,
        quickForm: {
          title: 'Quick Start',
          submitText: 'Continue',
          fields: [
            { key: 'fullName', label: 'Full Name', type: 'text', required: true },
            { key: 'phone',     label: 'Phone',     type: 'tel',  required: true },
            { key: 'gmail',     label: 'Gmail',     type: 'email',required: false },
          ]
        },
        contactsVCF: [
          { name: 'Nicetopper', phone: '08146573875' },
          { name: 'Tramatter',  phone: '07014262728' }
        ],
        copy: {
          intro: 'Welcome to Magnus Platform 👋',
          countryPrompt: 'Reply with your country to get payment details.',
          paymentNote: 'After payment, reply here and we’ll verify you.'
        },
        countryBanks: {
          nigeria:     { label:'Nigeria',      bank:'GTBank (Demo)',        number:'0123456789',   name:'Magnus Platform Demo' },
          ghana:       { label:'Ghana',        bank:'GCB Bank (Demo)',      number:'0234567890',   name:'Magnus Platform Demo' },
          kenya:       { label:'Kenya',        bank:'KCB (Demo)',           number:'1102345678',   name:'Magnus Platform Demo' },
          southafrica: { label:'South Africa', bank:'Standard Bank (Demo)', number:'000123456789', name:'Magnus Platform Demo' }
        }
      })
    }
  });

  await prisma.botFlow.upsert({
    where: { botId_version: { botId: bot.id, version: 1 } },
    update: {},
    create: {
      botId: bot.id,
      version: 1,
      steps: JSON.stringify([
        { type: 'botText', html: 'Let’s get you set up fast.' },
        { type: 'card', title: 'Step 1 — Get Started', html: '<p>Register and unlock tasks.</p>' }
      ])
    }
  });

  console.log('✅ Seed complete');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
