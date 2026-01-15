-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT NOT NULL,
    "plano" TEXT NOT NULL DEFAULT 'FREE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ATENDENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "cpfCnpj" TEXT,
    "observacoes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "placa" TEXT NOT NULL,
    "cor" TEXT,
    "clienteId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "imagemUrl" TEXT,
    "observacoes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "clienteId" TEXT NOT NULL,
    "veiculoId" TEXT,
    "observacoes" TEXT,
    "valorTotal" DOUBLE PRECISION,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "statusPagamento" TEXT DEFAULT 'PENDENTE',
    "formaPagamento" TEXT,
    "valorPago" DOUBLE PRECISION,
    "dataPagamento" TIMESTAMP(3),
    "comprovante" TEXT,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamento_servicos" (
    "id" TEXT NOT NULL,
    "agendamentoId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "agendamento_servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "agendamentoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "agendadaPara" TIMESTAMP(3),
    "enviadaEm" TIMESTAMP(3),
    "mensagem" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "tenantId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueios_horario" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "diaSemana" INTEGER,
    "dataEspecifica" TIMESTAMP(3),
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "diaInteiro" BOOLEAN NOT NULL DEFAULT false,
    "motivo" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloqueios_horario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_email_key" ON "tenants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_stripeCustomerId_key" ON "tenants"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "clientes_tenantId_idx" ON "clientes"("tenantId");

-- CreateIndex
CREATE INDEX "clientes_telefone_idx" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "clientes_email_idx" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_tenantId_telefone_key" ON "clientes"("tenantId", "telefone");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_tenantId_email_key" ON "clientes"("tenantId", "email");

-- CreateIndex
CREATE INDEX "veiculos_tenantId_idx" ON "veiculos"("tenantId");

-- CreateIndex
CREATE INDEX "veiculos_placa_idx" ON "veiculos"("placa");

-- CreateIndex
CREATE INDEX "veiculos_clienteId_idx" ON "veiculos"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_tenantId_placa_key" ON "veiculos"("tenantId", "placa");

-- CreateIndex
CREATE INDEX "servicos_tenantId_idx" ON "servicos"("tenantId");

-- CreateIndex
CREATE INDEX "servicos_categoria_idx" ON "servicos"("categoria");

-- CreateIndex
CREATE INDEX "servicos_ativo_idx" ON "servicos"("ativo");

-- CreateIndex
CREATE INDEX "agendamentos_tenantId_idx" ON "agendamentos"("tenantId");

-- CreateIndex
CREATE INDEX "agendamentos_dataHora_idx" ON "agendamentos"("dataHora");

-- CreateIndex
CREATE INDEX "agendamentos_status_idx" ON "agendamentos"("status");

-- CreateIndex
CREATE INDEX "agendamentos_statusPagamento_idx" ON "agendamentos"("statusPagamento");

-- CreateIndex
CREATE INDEX "agendamentos_clienteId_idx" ON "agendamentos"("clienteId");

-- CreateIndex
CREATE INDEX "agendamentos_veiculoId_idx" ON "agendamentos"("veiculoId");

-- CreateIndex
CREATE INDEX "agendamento_servicos_agendamentoId_idx" ON "agendamento_servicos"("agendamentoId");

-- CreateIndex
CREATE INDEX "agendamento_servicos_servicoId_idx" ON "agendamento_servicos"("servicoId");

-- CreateIndex
CREATE UNIQUE INDEX "agendamento_servicos_agendamentoId_servicoId_key" ON "agendamento_servicos"("agendamentoId", "servicoId");

-- CreateIndex
CREATE INDEX "notificacoes_agendamentoId_idx" ON "notificacoes"("agendamentoId");

-- CreateIndex
CREATE INDEX "notificacoes_status_idx" ON "notificacoes"("status");

-- CreateIndex
CREATE INDEX "configuracoes_tenantId_idx" ON "configuracoes"("tenantId");

-- CreateIndex
CREATE INDEX "configuracoes_chave_idx" ON "configuracoes"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_tenantId_chave_key" ON "configuracoes"("tenantId", "chave");

-- CreateIndex
CREATE INDEX "bloqueios_horario_tenantId_idx" ON "bloqueios_horario"("tenantId");

-- CreateIndex
CREATE INDEX "bloqueios_horario_tipo_idx" ON "bloqueios_horario"("tipo");

-- CreateIndex
CREATE INDEX "bloqueios_horario_dataEspecifica_idx" ON "bloqueios_horario"("dataEspecifica");

-- CreateIndex
CREATE INDEX "bloqueios_horario_diaSemana_idx" ON "bloqueios_horario"("diaSemana");

-- CreateIndex
CREATE INDEX "bloqueios_horario_ativo_idx" ON "bloqueios_horario"("ativo");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento_servicos" ADD CONSTRAINT "agendamento_servicos_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento_servicos" ADD CONSTRAINT "agendamento_servicos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueios_horario" ADD CONSTRAINT "bloqueios_horario_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
