#!/bin/bash

cd /home/sdq-farm/code/agenda-estetica-auto/frontend

# Home page atualizada com navegação
cat > app/page.tsx << 'EOFPAGE'
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Car, Wrench, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-600 text-white p-6">
        <h1 className="text-3xl font-bold">🚗 Agenda Estética Auto</h1>
        <p className="text-primary-100 mt-2">Sistema de Agendamento - MVP Fase 1</p>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/clientes">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Clientes
                </CardTitle>
                <CardDescription>
                  Gerencie seus clientes e visualize histórico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Acessar Clientes</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/veiculos">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Veículos
                </CardTitle>
                <CardDescription>
                  Cadastro e gerenciamento de veículos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Acessar Veículos</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/servicos">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Serviços
                </CardTitle>
                <CardDescription>
                  Catálogo de serviços e preços
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Acessar Serviços</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/agendamentos">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Agendamentos
                </CardTitle>
                <CardDescription>
                  Agenda e controle de atendimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Acessar Agendamentos</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Status da Implementação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-green-700">✅ Backend NestJS completo (localhost:3333)</p>
            <p className="text-green-700">✅ Frontend Next.js com shadcn/ui</p>
            <p className="text-green-700">✅ Todas CRUDs implementados</p>
            <p className="text-green-700">✅ Banco SQLite populado</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
EOFPAGE

echo "✅ Home page created"

# Clientes page
cat > app/clientes/page.tsx << 'EOFCLIENTES'
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientesAPI } from '@/lib/api';
import { ArrowLeft, Plus, Edit, Trash2, Phone, Mail } from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    whatsapp: '',
    email: '',
    observacoes: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  async function loadClientes() {
    try {
      const data = await clientesAPI.getAll();
      setClientes(data.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await clientesAPI.update(editingId, formData);
      } else {
        await clientesAPI.create(formData);
      }
      setDialogOpen(false);
      resetForm();
      loadClientes();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente deletar este cliente?')) return;
    try {
      await clientesAPI.delete(id);
      loadClientes();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  }

  function resetForm() {
    setFormData({ nome: '', telefone: '', whatsapp: '', email: '', observacoes: '' });
    setEditingId(null);
  }

  function handleEdit(cliente: any) {
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone,
      whatsapp: cliente.whatsapp || '',
      email: cliente.email || '',
      observacoes: cliente.observacoes || '',
    });
    setEditingId(cliente.id);
    setDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-600 text-white p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary-700">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-primary-100 text-sm">Gerenciamento de clientes</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Total: {clientes.length} clientes</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do cliente
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        placeholder="11999999999"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="11999999999"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Input
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingId ? 'Salvar' : 'Criar'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Veículos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {cliente.telefone}
                          </div>
                          {cliente.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {cliente.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{cliente.veiculos?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(cliente)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(cliente.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
EOFCLIENTES

echo "✅ Clientes page created"

echo "✅ All pages created successfully!"
