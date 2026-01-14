'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BottomNav } from '@/components/bottom-nav';
import { MobileVehicleCard } from '@/components/mobile-vehicle-card';
import { veiculosAPI, clientesAPI } from '@/lib/api';
import { ArrowLeft, Plus, Edit, Trash2, Car, User, Calendar, Palette } from 'lucide-react';

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ marca: '', modelo: '', ano: new Date().getFullYear(), placa: '', cor: '', clienteId: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [veic, cli] = await Promise.all([veiculosAPI.getAll(), clientesAPI.getAll()]);
      setVeiculos(veic.data);
      setClientes(cli.data);
    } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      editingId ? await veiculosAPI.update(editingId, formData) : await veiculosAPI.create(formData);
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) { alert('Erro: ' + error.message); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente deletar este veículo?')) return;
    try { await veiculosAPI.delete(id); loadData(); } catch (error: any) { alert('Erro: ' + error.message); }
  }

  function resetForm() {
    setFormData({ marca: '', modelo: '', ano: new Date().getFullYear(), placa: '', cor: '', clienteId: '' });
    setEditingId(null);
  }

  function handleEdit(veiculo: any) {
    setFormData({ marca: veiculo.marca, modelo: veiculo.modelo, ano: veiculo.ano, placa: veiculo.placa, cor: veiculo.cor || '', clienteId: veiculo.clienteId });
    setEditingId(veiculo.id);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-20 lg:pb-4">
        {/* Premium Header com Glassmorphism */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
          <div className="container mx-auto max-w-6xl px-8 py-4 flex items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-100 min-w-[44px] min-h-[44px] rounded-xl">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-outfit font-bold text-gray-900 tracking-tight">Veículos</h1>
                <p className="text-sm font-medium text-gray-500">Gerenciamento</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-8 max-w-6xl mt-8 space-y-8">
          {/* Header com botão */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Meus Veículos</h2>
              <p className="text-sm text-gray-500 font-medium">Total: {veiculos.length} cadastrados</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 min-h-[44px] gap-2 rounded-xl">
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Novo Veículo</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do veículo
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clienteId">Cliente *</Label>
                    <select
                      id="clienteId"
                      className="w-full min-h-[44px] p-2 border border-gray-300 rounded-md bg-white"
                      value={formData.clienteId}
                      onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                      required
                    >
                      <option value="">Selecione um cliente</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca *</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      placeholder="Ex: Toyota"
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      placeholder="Ex: Corolla"
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ano">Ano *</Label>
                    <Input
                      id="ano"
                      type="number"
                      value={formData.ano}
                      onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                      placeholder="Ex: 2023"
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placa">Placa *</Label>
                    <Input
                      id="placa"
                      value={formData.placa}
                      onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                      placeholder="ABC1D23"
                      required
                      className="min-h-[44px] font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cor">Cor</Label>
                    <Input
                      id="cor"
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      placeholder="Ex: Prata"
                      className="min-h-[44px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingId ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Veículos */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
            </div>
          ) : veiculos.length === 0 ? (
            <ModernCard>
              <ModernCardContent className="py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Car className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum veículo cadastrado</h3>
                <p className="text-sm text-gray-500 mb-4">Comece adicionando seu primeiro veículo</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Veículo
                </Button>
              </ModernCardContent>
            </ModernCard>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {veiculos.map((v) => (
                  <MobileVehicleCard
                    key={v.id}
                    veiculo={v}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Desktop Cards */}
              <div className="hidden md:grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {veiculos.map((v) => (
                  <ModernCard key={v.id} className="group">
                    <ModernCardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <ModernCardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Car className="w-6 h-6" />
                            {v.marca} {v.modelo}
                          </ModernCardTitle>
                          <Badge className="mt-2 text-xs font-mono bg-gray-100 text-gray-900 hover:bg-gray-200 border-0">
                            {v.placa}
                          </Badge>
                        </div>
                      </div>
                    </ModernCardHeader>
                    <ModernCardContent className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-gray-700" />
                          </div>
                          <span className="font-medium">Ano: {v.ano}</span>
                        </div>
                        {v.cor && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Palette className="w-4 h-4 text-gray-700" />
                            </div>
                            <span className="font-medium">{v.cor}</span>
                          </div>
                        )}
                        {v.cliente && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-gray-700" />
                            </div>
                            <span className="font-medium">{v.cliente.nome}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(v)}
                          className="flex-1 min-h-[44px] hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 transition-colors rounded-xl font-medium"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(v.id)}
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
