import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Criar tenant demo
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      nome: 'Lava-Jato Demo',
      slug: 'demo',
      email: 'contato@demo.com',
      whatsapp: '11999999999',
      plano: 'FREE',
      ativo: true,
    },
  });

  console.log('✅ Tenant criado:', tenant.slug);

  // 2. Criar usuário admin
  const senhaHash = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      senha: senhaHash,
      nome: 'Administrador',
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Usuário criado:', user.email);

  // 3. Criar serviços de exemplo
  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        nome: 'Lavagem Simples',
        descricao: 'Lavagem externa do veículo',
        categoria: 'Lavagem',
        duracaoMinutos: 30,
        preco: 50,
        ativo: true,
        tenantId: tenant.id,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Lavagem Completa',
        descricao: 'Lavagem externa e interna',
        categoria: 'Lavagem',
        duracaoMinutos: 60,
        preco: 80,
        ativo: true,
        tenantId: tenant.id,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Polimento Técnico',
        descricao: 'Polimento profissional da pintura',
        categoria: 'Estética',
        duracaoMinutos: 180,
        preco: 300,
        ativo: true,
        tenantId: tenant.id,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Higienização Interna',
        descricao: 'Limpeza profunda do interior',
        categoria: 'Higienização',
        duracaoMinutos: 120,
        preco: 150,
        ativo: true,
        tenantId: tenant.id,
      },
    }),
  ]);

  console.log(`✅ ${servicos.length} serviços criados`);

  // 4. Criar clientes de exemplo
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nome: 'João Silva',
        telefone: '11987654321',
        whatsapp: '11987654321',
        email: 'joao@email.com',
        tenantId: tenant.id,
      },
    }),
    prisma.cliente.create({
      data: {
        nome: 'Maria Santos',
        telefone: '11976543210',
        whatsapp: '11976543210',
        email: 'maria@email.com',
        tenantId: tenant.id,
      },
    }),
  ]);

  console.log(`✅ ${clientes.length} clientes criados`);

  // 5. Criar veículos
  const veiculos = await Promise.all([
    prisma.veiculo.create({
      data: {
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2022,
        placa: 'ABC1234',
        cor: 'Prata',
        clienteId: clientes[0].id,
        tenantId: tenant.id,
      },
    }),
    prisma.veiculo.create({
      data: {
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2021,
        placa: 'XYZ5678',
        cor: 'Preto',
        clienteId: clientes[1].id,
        tenantId: tenant.id,
      },
    }),
  ]);

  console.log(`✅ ${veiculos.length} veículos criados`);

  // 6. Criar configurações de horário
  const diasSemana = [
    'domingo',
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
  ];

  for (let i = 0; i < diasSemana.length; i++) {
    const valor = i === 0 ? '' : '08:00-18:00'; // Domingo fechado
    await prisma.configuracao.create({
      data: {
        chave: `horario_${diasSemana[i]}`,
        valor,
        descricao: `Horário de funcionamento ${diasSemana[i]}`,
        tenantId: tenant.id,
      },
    });
  }

  console.log('✅ Configurações de horário criadas');

  // 7. Criar agendamentos de exemplo
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  await prisma.agendamento.create({
    data: {
      dataHora: tomorrow,
      status: 'CONFIRMADO',
      clienteId: clientes[0].id,
      veiculoId: veiculos[0].id,
      valorTotal: 380,
      observacoes: 'Cliente pediu atenção especial aos bancos',
      tenantId: tenant.id,
      servicos: {
        create: [
          {
            servicoId: servicos[1].id, // Lavagem Completa
            preco: 80,
          },
          {
            servicoId: servicos[2].id, // Polimento
            preco: 300,
          },
        ],
      },
    },
  });

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(10, 0, 0, 0);

  await prisma.agendamento.create({
    data: {
      dataHora: dayAfterTomorrow,
      status: 'PENDENTE',
      clienteId: clientes[1].id,
      veiculoId: veiculos[1].id,
      valorTotal: 150,
      tenantId: tenant.id,
      servicos: {
        create: [
          {
            servicoId: servicos[3].id, // Higienização
            preco: 150,
          },
        ],
      },
    },
  });

  console.log('✅ 2 agendamentos criados');

  console.log('🎉 Seed completo!');
  console.log('');
  console.log('📝 Credenciais de acesso:');
  console.log('   Email: admin@demo.com');
  console.log('   Senha: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
