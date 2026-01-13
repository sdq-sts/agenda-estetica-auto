import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Create services
  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        nome: 'Lavagem Simples',
        descricao: 'Lavagem externa completa do veículo',
        categoria: 'Lavagem',
        duracaoMinutos: 30,
        preco: 50,
        ativo: true,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Lavagem Completa',
        descricao: 'Lavagem externa e interna completa',
        categoria: 'Lavagem',
        duracaoMinutos: 60,
        preco: 100,
        ativo: true,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Polimento Técnico',
        descricao: 'Polimento profissional com cera de alta qualidade',
        categoria: 'Polimento',
        duracaoMinutos: 120,
        preco: 300,
        ativo: true,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Higienização Interna',
        descricao: 'Limpeza profunda do interior com aspiração e higienização',
        categoria: 'Higienização',
        duracaoMinutos: 90,
        preco: 150,
        ativo: true,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Cristalização de Vidros',
        descricao: 'Aplicação de película protetora nos vidros',
        categoria: 'Proteção',
        duracaoMinutos: 45,
        preco: 200,
        ativo: true,
      },
    }),
  ]);

  console.log(`✅ ${servicos.length} serviços criados`);

  // Create clients
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'João Silva',
      telefone: '11999999999',
      whatsapp: '11999999999',
      email: 'joao.silva@email.com',
      observacoes: 'Cliente VIP - Prefere atendimento matutino',
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: 'Maria Santos',
      telefone: '11988888888',
      whatsapp: '11988888888',
      email: 'maria.santos@email.com',
    },
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      nome: 'Pedro Oliveira',
      telefone: '11977777777',
    },
  });

  console.log('✅ 3 clientes criados');

  // Create vehicles
  const veiculo1 = await prisma.veiculo.create({
    data: {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2023,
      placa: 'ABC1234',
      cor: 'Prata',
      clienteId: cliente1.id,
    },
  });

  const veiculo2 = await prisma.veiculo.create({
    data: {
      marca: 'Honda',
      modelo: 'Civic',
      ano: 2024,
      placa: 'XYZ5678',
      cor: 'Preto',
      clienteId: cliente2.id,
    },
  });

  await prisma.veiculo.create({
    data: {
      marca: 'Volkswagen',
      modelo: 'Gol',
      ano: 2020,
      placa: 'DEF9012',
      cor: 'Branco',
      clienteId: cliente3.id,
    },
  });

  console.log('✅ 3 veículos criados');

  // Create appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  await prisma.agendamento.create({
    data: {
      dataHora: tomorrow,
      status: 'CONFIRMADO',
      clienteId: cliente1.id,
      veiculoId: veiculo1.id,
      valorTotal: 400,
      observacoes: 'Cliente pediu atenção especial aos bancos',
      servicos: {
        create: [
          {
            servicoId: servicos[1].id, // Lavagem Completa
            preco: 100,
          },
          {
            servicoId: servicos[2].id, // Polimento Técnico
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
      clienteId: cliente2.id,
      veiculoId: veiculo2.id,
      valorTotal: 250,
      servicos: {
        create: [
          {
            servicoId: servicos[0].id, // Lavagem Simples
            preco: 50,
          },
          {
            servicoId: servicos[4].id, // Cristalização
            preco: 200,
          },
        ],
      },
    },
  });

  console.log('✅ 2 agendamentos criados');

  console.log('\n🎉 Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
