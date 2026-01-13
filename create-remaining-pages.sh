#!/bin/bash
cd /home/sdq-farm/code/agenda-estetica-auto/frontend

# Veículos Page
cat > app/veiculos/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { veiculosAPI, clientesAPI } from '@/lib/api';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

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
    if (!confirm('Deseja deletar este veículo?')) return;
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-600 text-white p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/"><Button variant="ghost" size="icon" className="text-white hover:bg-primary-700"><ArrowLeft /></Button></Link>
          <div><h1 className="text-2xl font-bold">Veículos</h1><p className="text-primary-100 text-sm">Gerenciamento de veículos</p></div>
        </div>
      </header>
      <main className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div><CardTitle>Lista de Veículos</CardTitle><CardDescription>Total: {veiculos.length}</CardDescription></div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild><Button onClick={resetForm}><Plus className="w-4 h-4 mr-2" />Novo Veículo</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Novo'} Veículo</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div><Label>Cliente *</Label><select className="w-full p-2 border rounded" value={formData.clienteId} onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })} required>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                    <div><Label>Marca *</Label><Input value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} required /></div>
                    <div><Label>Modelo *</Label><Input value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} required /></div>
                    <div><Label>Ano *</Label><Input type="number" value={formData.ano} onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })} required /></div>
                    <div><Label>Placa *</Label><Input value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} required /></div>
                    <div><Label>Cor</Label><Input value={formData.cor} onChange={(e) => setFormData({ ...formData, cor: e.target.value })} /></div>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-center py-8">Carregando...</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Veículo</TableHead><TableHead>Placa</TableHead><TableHead>Cliente</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {veiculos.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.marca} {v.modelo} ({v.ano})</TableCell>
                      <TableCell className="font-mono">{v.placa}</TableCell>
                      <TableCell>{v.cliente?.nome}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(v)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(v.id)}><Trash2 className="w-4 h-4" /></Button>
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
EOF

# Serviços Page
cat > app/servicos/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { servicosAPI } from '@/lib/api';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';

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

  function resetForm() { setFormData({ nome: '', descricao: '', categoria: '', duracaoMinutos: 30, preco: 0 }); setEditingId(null); }
  function handleEdit(servico: any) { setFormData(servico); setEditingId(servico.id); setDialogOpen(true); }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-600 text-white p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/"><Button variant="ghost" size="icon" className="text-white hover:bg-primary-700"><ArrowLeft /></Button></Link>
          <div><h1 className="text-2xl font-bold">Serviços</h1></div>
        </div>
      </header>
      <main className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between mb-4">
          <div><h2 className="text-xl font-bold">Catálogo de Serviços</h2><p className="text-sm text-muted-foreground">Total: {servicos.length}</p></div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Serviço</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Novo'} Serviço</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Nome *</Label><Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required /></div>
                <div><Label>Descrição</Label><Input value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} /></div>
                <div><Label>Categoria *</Label><Input value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} required /></div>
                <div><Label>Duração (min) *</Label><Input type="number" value={formData.duracaoMinutos} onChange={(e) => setFormData({ ...formData, duracaoMinutos: parseInt(e.target.value) })} required /></div>
                <div><Label>Preço (R$) *</Label><Input type="number" step="0.01" value={formData.preco} onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) })} required /></div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {loading ? <p>Carregando...</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servicos.map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle>{s.nome}</CardTitle>
                  <CardDescription>{s.categoria}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{s.descricao}</p>
                  <div className="flex justify-between items-center mt-4">
                    <div><p className="text-2xl font-bold text-primary-600">R$ {s.preco.toFixed(2)}</p><p className="text-xs text-muted-foreground">{s.duracaoMinutos} min</p></div>
                    <div className="flex gap-2"><Button variant="outline" size="icon" onClick={() => handleEdit(s)}><Edit className="w-4 h-4" /></Button></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
EOF

# Agendamentos Page - Simplified
cat > app/agendamentos/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { agendamentosAPI } from '@/lib/api';
import { ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors: any = { PENDENTE: 'bg-warning-100 text-warning-800', CONFIRMADO: 'bg-primary-100 text-primary-800', CONCLUIDO: 'bg-success-100 text-success-800', CANCELADO: 'bg-danger-100 text-danger-800' };

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAgendamentos(); }, []);

  async function loadAgendamentos() {
    try { const data = await agendamentosAPI.getAll(); setAgendamentos(data.data); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-600 text-white p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/"><Button variant="ghost" size="icon" className="text-white hover:bg-primary-700"><ArrowLeft /></Button></Link>
          <div><h1 className="text-2xl font-bold">Agendamentos</h1></div>
        </div>
      </header>
      <main className="container mx-auto p-6 max-w-6xl">
        <h2 className="text-xl font-bold mb-4">Próximos Agendamentos ({agendamentos.length})</h2>
        {loading ? <p>Carregando...</p> : (
          <div className="space-y-4">
            {agendamentos.map((a) => (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />{a.cliente?.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{format(new Date(a.dataHora), 'PPP - HH:mm', { locale: ptBR })}</p>
                    </div>
                    <Badge className={statusColors[a.status] || ''}>{a.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {a.veiculo && <p className="text-sm"><strong>Veículo:</strong> {a.veiculo.marca} {a.veiculo.modelo} - {a.veiculo.placa}</p>}
                  <p className="text-sm"><strong>Serviços:</strong> {a.servicos?.map((s: any) => s.servico.nome).join(', ')}</p>
                  <p className="text-lg font-bold text-primary-600 mt-2">Total: R$ {a.valorTotal?.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
EOF

echo "✅ All remaining pages created!"
