import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/use-customer-auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Star, LogOut, ArrowLeft, ShoppingBag, Trophy, User, Phone, Mail,
  MapPin, Edit2, Save, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderRow {
  id: string;
  total: number;
  status: string;
  created_at: string;
  item_count: number;
}

const Conta = () => {
  const { user, profile, loading, loyaltyPoints, loyaltyActive, signOut, refreshPoints, updateProfile } = useCustomerAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable form state
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    gender: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/conta/login');
    }
  }, [user, loading, navigate]);

  // Sync profile into form
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        address_street: profile.address_street || '',
        address_number: profile.address_number || '',
        address_complement: profile.address_complement || '',
        address_neighborhood: profile.address_neighborhood || '',
        address_city: profile.address_city || '',
        address_state: profile.address_state || '',
        address_zip: profile.address_zip || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await (supabase as any)
        .from('customer_orders')
        .select('id, total, status, created_at, item_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setOrders((data as OrderRow[]) || []);
      setLoadingOrders(false);
    };
    fetchOrders();
    refreshPoints();
  }, [user]);

  const formatPrice = (price: number) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(form);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Perfil atualizado! ✅' });
      setEditing(false);
    }
    setSaving(false);
  };

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const genderOptions = [
    { value: '', label: 'Não informado' },
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' },
    { value: 'other', label: 'Outro' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-4 max-w-2xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full gradient-burger flex items-center justify-center text-primary-foreground font-bold text-xl">
                {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{profile?.full_name || 'Cliente'}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>

          {/* Loyalty Points */}
          {loyaltyActive && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-4">
              <Trophy className="w-10 h-10 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Programa de Fidelidade</p>
                <p className="text-2xl font-bold text-primary">{loyaltyPoints} pontos</p>
              </div>
              <Star className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>

        {/* Profile Details / Edit Form */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Dados Pessoais
          </h3>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground">Nome Completo</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground">Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">Sexo</Label>
                <div className="flex gap-2 flex-wrap">
                  {genderOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateField('gender', opt.value)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                        form.gender === opt.value
                          ? 'gradient-burger text-primary-foreground border-transparent'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="pt-2">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Endereço
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={form.address_zip}
                    onChange={(e) => updateField('address_zip', e.target.value)}
                    placeholder="CEP"
                    className="bg-background border-border"
                  />
                  <Input
                    value={form.address_state}
                    onChange={(e) => updateField('address_state', e.target.value)}
                    placeholder="Estado (UF)"
                    maxLength={2}
                    className="bg-background border-border"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <Input
                    value={form.address_city}
                    onChange={(e) => updateField('address_city', e.target.value)}
                    placeholder="Cidade"
                    className="bg-background border-border"
                  />
                  <Input
                    value={form.address_neighborhood}
                    onChange={(e) => updateField('address_neighborhood', e.target.value)}
                    placeholder="Bairro"
                    className="bg-background border-border"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Input
                    value={form.address_street}
                    onChange={(e) => updateField('address_street', e.target.value)}
                    placeholder="Rua"
                    className="col-span-2 bg-background border-border"
                  />
                  <Input
                    value={form.address_number}
                    onChange={(e) => updateField('address_number', e.target.value)}
                    placeholder="Nº"
                    className="bg-background border-border"
                  />
                </div>
                <Input
                  value={form.address_complement}
                  onChange={(e) => updateField('address_complement', e.target.value)}
                  placeholder="Complemento (apt, bloco...)"
                  className="mt-3 bg-background border-border"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 gradient-burger text-primary-foreground font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    // Reset form
                    if (profile) {
                      setForm({
                        full_name: profile.full_name || '',
                        phone: profile.phone || '',
                        gender: profile.gender || '',
                        address_street: profile.address_street || '',
                        address_number: profile.address_number || '',
                        address_complement: profile.address_complement || '',
                        address_neighborhood: profile.address_neighborhood || '',
                        address_city: profile.address_city || '',
                        address_state: profile.address_state || '',
                        address_zip: profile.address_zip || '',
                      });
                    }
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow icon={<User className="w-4 h-4" />} label="Nome" value={profile?.full_name} />
              <InfoRow icon={<Mail className="w-4 h-4" />} label="E-mail" value={user.email} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Telefone" value={profile?.phone} />
              <InfoRow
                label="Sexo"
                value={
                  profile?.gender === 'male' ? 'Masculino' :
                  profile?.gender === 'female' ? 'Feminino' :
                  profile?.gender === 'other' ? 'Outro' :
                  null
                }
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label="Endereço"
                value={buildAddressString(profile)}
              />
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Meus Pedidos
          </h3>

          {loadingOrders ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 bg-card border border-border rounded-xl">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum pedido ainda</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
                Ver Cardápio
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {order.item_count} {order.item_count === 1 ? 'item' : 'itens'}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                    <span className={cn(
                      'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                      order.status === 'sent' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      {order.status === 'sent' ? 'Enviado' : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full py-5 text-destructive hover:bg-destructive/10"
          onClick={async () => { await signOut(); navigate('/'); }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};

/* Helper components */
const InfoRow = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string | null }) => (
  <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
    {icon && <span className="text-primary mt-0.5">{icon}</span>}
    {!icon && <span className="w-4" />}
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  </div>
);

const buildAddressString = (profile: any) => {
  if (!profile) return null;
  const parts = [
    profile.address_street,
    profile.address_number ? `nº ${profile.address_number}` : null,
    profile.address_complement,
    profile.address_neighborhood,
    profile.address_city,
    profile.address_state,
    profile.address_zip,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

export default Conta;
