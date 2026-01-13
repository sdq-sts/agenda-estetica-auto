'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BottomNav } from '@/components/bottom-nav';
import { servicosAPI } from '@/lib/api';
import { ArrowLeft, Plus, Edit, Trash2, Clock, Tag } from 'lucide-react';

export default function ServicosPage() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', categoria: '', duracaoMinutos: 30, preco: 0 });

  useEffect(() => { loadServicos(); }, []);

  async function loadServicos() {
    try { const data = await servicosAPI.getAll(); setServicos(data.data); } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      editingId ? await servicosAPI.update(editingId, formData) : await servicosAPI.create(formData);
      setDialogOpen(false); resetForm(); loadServicos();
    } catch (error: any) { alert('Erro: ' + error.message); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente deletar este serviço?')) return;
    try {
      await servicosAPI.delete(id);
      loadServicos();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  }

  function resetForm() { setFormData({ nome: '', descricao: '', categoria: '', duracaoMinutos: 30, preco: 0 }); setEditingId(null); }
  function handleEdit(servico: any) { setFormData(servico); setEditingId(servico.id); setDialogOpen(true); }

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
                <h1 className="text-2xl font-outfit font-bold text-gray-900 tracking-tight">Serviços</h1>
                <p className="text-sm font-medium text-gray-500">Catálogo e Preços</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-8 max-w-6xl mt-8 space-y-8">
          {/* Header com botão */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Catálogo de Serviços</h2>
              <p className="text-sm text-gray-500 font-medium">Total: {servicos.length} cadastrados</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 min-h-[44px] gap-2 rounded-xl">
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Novo Serviço</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do serviço
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Serviço *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Polimento Completo"
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Detalhes do serviço"
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Input
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      placeholder="Ex: Estética Automotiva"
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duracao">Duração (minutos) *</Label>
                    <Input
                      id="duracao"
                      type="number"
                      value={formData.duracaoMinutos}
                      onChange={(e) => setFormData({ ...formData, duracaoMinutos: parseInt(e.target.value) })}
                      placeholder="Ex: 60"
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) })}
                      placeholder="Ex: 150.00"
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingId ? 'Salvar Alterações' : 'Cadastrar Serviço'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Serviços */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
            </div>
          ) : servicos.length === 0 ? (
            <ModernCard>
              <ModernCardContent className="py-12 text-center">
                <div className="text-gray-300 mb-4">
                  <Plus className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 ">Nenhum serviço cadastrado</h3>
                <p className="text-sm text-gray-500 mb-4">Comece adicionando seu primeiro serviço</p>
                <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </ModernCardContent>
            </ModernCard>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {servicos.map((s) => (
                <ModernCard key={s.id} className="group">
                  <ModernCardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <ModernCardTitle className="text-lg">{s.nome}</ModernCardTitle>
                        <Badge variant="outline" className="mt-2 text-xs border-blue-200 bg-blue-50 text-blue-700">
                          <Tag className="w-3 h-3 mr-1" />
                          {s.categoria}
                        </Badge>
                      </div>
                    </div>
                  </ModernCardHeader>
                  <ModernCardContent className="space-y-3">
                    {s.descricao && (
                      <p className="text-sm text-gray-600 font-medium">{s.descricao}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Clock className="w-4 h-4" />
                      <span>{s.duracaoMinutos} minutos</span>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-3xl font-bold text-gray-900 ">R$ {s.preco.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(s)}
                        className="flex-1 min-h-[44px] hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 transition-colors rounded-xl font-medium"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                        className="min-h-[44px] min-w-[44px] rounded-xl hover:scale-105 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              ))}
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
