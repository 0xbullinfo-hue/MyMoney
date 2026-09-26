import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MyMoney database...');

  const defaultPassword = process.env.DEMO_PASSWORD || 'MyMoney2026!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Primary User
  const adminUser = await prisma.user.upsert({
    where: { email: 'adekunle@mymoney.ng' },
    update: {},
    create: {
      id: 'user-1',
      email: 'adekunle@mymoney.ng',
      passwordHash,
      name: 'Adekunle Okonkwo',
      phone: '+2348012345678',
      tier: 'premium',
      isAdmin: true,
      suspended: false,
      stealthModeEnabled: false,
      globalCardFreeze: false,
    },
  });

  // 2. Demo Bank Nodes for primary user
  const nodes = [
    {
      id: 'node-gtb',
      userId: adminUser.id,
      institutionId: 'gtb',
      institutionName: 'Guaranty Trust Bank (GTBank)',
      category: 'Commercial',
      balance: 14250000,
      currency: 'NGN',
      status: 'active',
      latencyMs: 14,
      monthlyFee: 50,
    },
    {
      id: 'node-stanbic',
      userId: adminUser.id,
      institutionId: 'stanbic',
      institutionName: 'Stanbic IBTC Holdings',
      category: 'Investment & Commercial',
      balance: 28400000,
      currency: 'NGN',
      status: 'active',
      latencyMs: 19,
      monthlyFee: 0,
    },
    {
      id: 'node-kuda',
      userId: adminUser.id,
      institutionId: 'kuda',
      institutionName: 'Kuda Microfinance Bank',
      category: 'Digital MFB',
      balance: 2150000,
      currency: 'NGN',
      status: 'active',
      latencyMs: 8,
      monthlyFee: 0,
    },
    {
      id: 'node-zenith',
      userId: adminUser.id,
      institutionId: 'zenith',
      institutionName: 'Zenith Bank PLC',
      category: 'Commercial',
      balance: 8900000,
      currency: 'NGN',
      status: 'active',
      latencyMs: 28,
      monthlyFee: 50,
    },
  ];

  for (const n of nodes) {
    await prisma.bankNode.upsert({
      where: { id: n.id },
      update: {},
      create: n,
    });
  }

  // 3. Subscriptions
  const subscriptions = [
    {
      id: 'sub-netflix',
      userId: adminUser.id,
      nodeId: 'node-gtb',
      merchantName: 'Netflix Standard HD',
      amount: 4500,
      billingCycle: 'monthly',
      status: 'active',
      category: 'Subscriptions',
      daysInactive: 4,
    },
    {
      id: 'sub-starlink',
      userId: adminUser.id,
      nodeId: 'node-gtb',
      merchantName: 'Starlink Nigeria High-Speed',
      amount: 38000,
      billingCycle: 'monthly',
      status: 'active',
      category: 'Subscriptions',
      daysInactive: 12,
    },
    {
      id: 'sub-zombie-gym',
      userId: adminUser.id,
      nodeId: 'node-stanbic',
      merchantName: 'Fitness Central Ikoyi',
      amount: 35000,
      billingCycle: 'monthly',
      status: 'flagged_zombie',
      category: 'Lifestyle',
      daysInactive: 68,
    },
    {
      id: 'sub-zombie-cloud',
      userId: adminUser.id,
      nodeId: 'node-kuda',
      merchantName: 'Legacy Cloud Hosting Inc',
      amount: 19500,
      billingCycle: 'monthly',
      status: 'flagged_zombie',
      category: 'Operations',
      daysInactive: 94,
    },
  ];

  for (const s of subscriptions) {
    await prisma.subscription.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }

  // 4. Payday Inflow Rule
  await prisma.paydayRule.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      minInflowThreshold: 250000,
      narrationKeywords: 'SALARY,DIVIDEND,CONSULTING,PAYOUT',
      executionMode: 'autonomous',
      primaryReceivingNodeId: 'node-gtb',
      residualStrategy: 'sweep_to_savings',
      globalFreezeActive: false,
    },
  });

  // 5. Initial Bill Routes
  const bills = [
    {
      id: 'bill-ikedc',
      userId: adminUser.id,
      name: 'Ikeja Electric (IKEDC) Prepaid',
      category: 'utilities',
      categoryLabel: 'Electricity & Power',
      icon: 'bolt',
      targetAmount: 65000,
      maxSpendingCap: 80000,
      billerIdentifier: '0101192847291',
      assignedPaymentSourceName: 'GTBank Direct Debit Mandate',
      isAutoEnabled: true,
      status: 'active',
      description: 'Automated 1st-of-month power token generation.',
    },
    {
      id: 'bill-mtn',
      userId: adminUser.id,
      name: 'MTN 5G Broadband Reserve',
      category: 'telecom_data',
      categoryLabel: 'Internet & Telecom',
      icon: 'wifi',
      targetAmount: 25000,
      maxSpendingCap: 30000,
      billerIdentifier: '08031234567',
      assignedPaymentSourceName: 'Kuda MFB Mandate',
      isAutoEnabled: true,
      status: 'active',
      description: 'Fiber-to-the-home uncapped monthly renewal.',
    },
    {
      id: 'bill-rent',
      userId: adminUser.id,
      name: 'Victoria Island Rent Sinking Fund',
      category: 'housing_rent',
      categoryLabel: 'Housing & Rent Vault',
      icon: 'home',
      targetAmount: 200000,
      maxSpendingCap: 200000,
      billerIdentifier: 'Stanbic Rent MMF Vault',
      assignedPaymentSourceName: 'Stanbic IBTC Direct Mandate',
      isAutoEnabled: true,
      status: 'active',
      description: 'Monthly rent sinking fund earning 14% p.a., compounded daily.',
    },
  ];

  for (const b of bills) {
    await prisma.billRoute.upsert({
      where: { id: b.id },
      update: {},
      create: b,
    });
  }

  console.log('✅ Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
