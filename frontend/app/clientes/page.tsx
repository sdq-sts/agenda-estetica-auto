'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/bottom-nav';
import { MobileClientCard } from '@/components/mobile-client-card';
import { clientesAPI } from '@/lib/api';
import { ArrowLeft, Plus, Edit, Trash2, Phone, Mail, Car, Calendar, Users } from 'lucide-react';

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
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-20 lg:pb-4">
        {/* Refined Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
          <div className="container mx-auto max-w-6xl px-8 py-4 flex items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-outfit font-bold text-gray-900 tracking-tight">Clientes</h1>
                <p className="text-sm font-medium text-gray-500">Gerenciamento</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-8 max-w-6xl mt-8 space-y-8">
          {/* Header com botão */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Meus Clientes</h2>
              <p className="text-sm text-gray-600 mt-0.5">Total: {clientes.length} cadastrados</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 min-h-[44px] gap-2 rounded-xl">
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Novo Cliente</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do cliente
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: João Silva"
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="11999999999"
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="11999999999"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="cliente@email.com"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Informações adicionais"
                      className="min-h-[44px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Clientes */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
            </div>
          ) : clientes.length === 0 ? (
            <ModernCard>
              <ModernCardContent className="py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Users className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum cliente cadastrado</h3>
                <p className="text-sm text-gray-500 mb-4">Comece adicionando seu primeiro cliente</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Cliente
                </Button>
              </ModernCardContent>
            </ModernCard>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {clientes.map((cliente) => (
                  <MobileClientCard
                    key={cliente.id}
                    cliente={cliente}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Desktop Cards */}
              <div className="hidden md:grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {clientes.map((cliente) => (
                  <ModernCard key={cliente.id} className="group">
                    <ModernCardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <ModernCardTitle className="text-xl font-bold text-gray-900">{cliente.nome}</ModernCardTitle>
                          {cliente.observacoes && (
                            <Badge variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700 bg-blue-50">
                              {cliente.observacoes}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </ModernCardHeader>
                    <ModernCardContent className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-gray-700" />
                          </div>
                          <span className="font-medium">{cliente.telefone}</span>
                        </div>
                        {cliente.email && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Mail className="w-4 h-4 text-gray-700" />
                            </div>
                            <span className="truncate font-medium">{cliente.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Car className="w-4 h-4 text-gray-700" />
                          </div>
                          <span className="font-medium">{cliente.veiculos?.length || 0} veículo(s)</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-gray-700" />
                          </div>
                          <span className="font-medium">{cliente._count?.agendamentos || 0} agendamento(s)</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cliente)}
                          className="flex-1 min-h-[44px] hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 transition-colors rounded-xl font-medium"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(cliente.id)}
                          className="min-h-[44px] min-w-[44px] rounded-xl hover:scale-105 transition-transform"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
