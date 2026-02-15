import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  Plus, Trash2, Edit2, LogOut, Save, X, Image as ImageIcon,
  LayoutGrid, Package, Upload, Star, StarOff, Gift, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface Upsell {
  id: string;
  product_id: string;
  upsell_product_id: string;
  extra_price: number;
  label: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  original_price: number;
  promo_price: number;
  image_url: string | null;
  valid_until: string;
  items: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'upsells' | 'promotions'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category_id: '', is_popular: false, image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', icon: 'utensils' });

  // Upsell form
  const [showUpsellForm, setShowUpsellForm] = useState(false);
  const [editingUpsell, setEditingUpsell] = useState<Upsell | null>(null);
  const [upsellForm, setUpsellForm] = useState({
    product_id: '', upsell_product_id: '', extra_price: '', label: ''
  });

  // Promotion form
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [promoForm, setPromoForm] = useState({
    title: '', description: '', original_price: '', promo_price: '', valid_until: 'Hoje', items: '', image_url: '', is_active: true
  });
  const [promoImageFile, setPromoImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const [catRes, prodRes, upsellRes, promoRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*').order('sort_order'),
      supabase.from('product_upsells').select('*').order('sort_order'),
      (supabase as any).from('promotions').select('*').order('sort_order'),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (prodRes.data) setProducts(prodRes.data);
    if (upsellRes.data) setUpsells(upsellRes.data);
    if (promoRes.data) setPromotions(promoRes.data as unknown as Promotion[]);
    setLoading(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) {
      toast({ title: 'Erro ao enviar imagem', description: error.message, variant: 'destructive' });
      return null;
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  // Product CRUD
  const handleProductSubmit = async () => {
    let imageUrl = productForm.image_url;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) imageUrl = url;
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category_id: productForm.category_id,
      is_popular: productForm.is_popular,
      image_url: imageUrl || null,
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Produto atualizado!' });
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Produto criado!' });
    }

    resetProductForm();
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Produto removido!' });
    fetchData();
  };

  const editProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category_id: p.category_id,
      is_popular: p.is_popular,
      image_url: p.image_url || '',
    });
    setShowProductForm(true);
  };

  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: '', category_id: '', is_popular: false, image_url: '' });
    setEditingProduct(null);
    setImageFile(null);
    setShowProductForm(false);
  };

  // Category CRUD
  const handleCategorySubmit = async () => {
    const payload = { name: categoryForm.name, slug: categoryForm.slug, icon: categoryForm.icon };

    if (editingCategory) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editingCategory.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Categoria atualizada!' });
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Categoria criada!' });
    }

    resetCategoryForm();
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Categoria removida!' });
    fetchData();
  };

  const editCategory = (c: Category) => {
    setEditingCategory(c);
    setCategoryForm({ name: c.name, slug: c.slug, icon: c.icon });
    setShowCategoryForm(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', slug: '', icon: 'utensils' });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  // Upsell CRUD
  const handleUpsellSubmit = async () => {
    const payload = {
      product_id: upsellForm.product_id,
      upsell_product_id: upsellForm.upsell_product_id,
      extra_price: parseFloat(upsellForm.extra_price),
      label: upsellForm.label,
    };

    if (editingUpsell) {
      const { error } = await supabase.from('product_upsells').update(payload).eq('id', editingUpsell.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Oferta atualizada!' });
    } else {
      const { error } = await supabase.from('product_upsells').insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Oferta criada!' });
    }

    resetUpsellForm();
    fetchData();
  };

  const deleteUpsell = async (id: string) => {
    const { error } = await supabase.from('product_upsells').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Oferta removida!' });
    fetchData();
  };

  const editUpsell = (u: Upsell) => {
    setEditingUpsell(u);
    setUpsellForm({
      product_id: u.product_id,
      upsell_product_id: u.upsell_product_id,
      extra_price: String(u.extra_price),
      label: u.label,
    });
    setShowUpsellForm(true);
  };

  const resetUpsellForm = () => {
    setUpsellForm({ product_id: '', upsell_product_id: '', extra_price: '', label: '' });
    setEditingUpsell(null);
    setShowUpsellForm(false);
  };

  // Promotion CRUD
  const handlePromoSubmit = async () => {
    let imageUrl = promoForm.image_url;
    if (promoImageFile) {
      const url = await uploadImage(promoImageFile);
      if (url) imageUrl = url;
    }

    const itemsArray = promoForm.items
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const payload = {
      title: promoForm.title,
      description: promoForm.description,
      original_price: parseFloat(promoForm.original_price),
      promo_price: parseFloat(promoForm.promo_price),
      valid_until: promoForm.valid_until,
      items: itemsArray,
      image_url: imageUrl || null,
      is_active: promoForm.is_active,
    };

    if (editingPromo) {
      const { error } = await (supabase as any).from('promotions').update(payload as any).eq('id', editingPromo.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Promoção atualizada!' });
    } else {
      const { error } = await (supabase as any).from('promotions').insert(payload as any);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Promoção criada!' });
    }

    resetPromoForm();
    fetchData();
  };

  const deletePromo = async (id: string) => {
    const { error } = await (supabase as any).from('promotions').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Promoção removida!' });
    fetchData();
  };

  const editPromo = (p: Promotion) => {
    setEditingPromo(p);
    setPromoForm({
      title: p.title,
      description: p.description,
      original_price: String(p.original_price),
      promo_price: String(p.promo_price),
      valid_until: p.valid_until,
      items: (p.items || []).join('\n'),
      image_url: p.image_url || '',
      is_active: p.is_active,
    });
    setShowPromoForm(true);
  };

  const resetPromoForm = () => {
    setPromoForm({ title: '', description: '', original_price: '', promo_price: '', valid_until: 'Hoje', items: '', image_url: '', is_active: true });
    setEditingPromo(null);
    setPromoImageFile(null);
    setShowPromoForm(false);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? '';
  const getProductName = (id: string) => products.find(p => p.id === id)?.name ?? '';

  const formatPrice = (price: number) =>
    Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const iconOptions = [
    'beef', 'cherry', 'cup-soda', 'pizza', 'cake', 'coffee', 'ice-cream-cone',
    'sandwich', 'salad', 'cookie', 'fish', 'egg-fried', 'popcorn', 'wine'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-foreground">
            Painel <span className="text-gradient-burger">Admin</span>
          </h1>
          <Button variant="ghost" onClick={() => { signOut(); navigate('/'); }}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <div className="container px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
            className={activeTab === 'products' ? 'gradient-burger text-primary-foreground' : ''}
          >
            <Package className="w-4 h-4 mr-2" /> Produtos
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
            className={activeTab === 'categories' ? 'gradient-burger text-primary-foreground' : ''}
          >
            <LayoutGrid className="w-4 h-4 mr-2" /> Categorias
          </Button>
          <Button
            variant={activeTab === 'upsells' ? 'default' : 'outline'}
            onClick={() => setActiveTab('upsells')}
            className={activeTab === 'upsells' ? 'gradient-burger text-primary-foreground' : ''}
          >
            <Gift className="w-4 h-4 mr-2" /> Ofertas Combo
          </Button>
          <Button
            variant={activeTab === 'promotions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('promotions')}
            className={activeTab === 'promotions' ? 'gradient-burger text-primary-foreground' : ''}
          >
            <Tag className="w-4 h-4 mr-2" /> Promoções
          </Button>
        </div>

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'gradient-burger text-primary-foreground' : ''}
                >
                  Todos
                </Button>
                {categories.map(c => (
                  <Button
                    key={c.id}
                    variant={selectedCategory === c.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(c.id)}
                    className={selectedCategory === c.id ? 'gradient-burger text-primary-foreground' : ''}
                  >
                    {c.name}
                  </Button>
                ))}
              </div>
              <Button onClick={() => { resetProductForm(); setShowProductForm(true); }} className="gradient-burger text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Novo Produto
              </Button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={resetProductForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Nome</label>
                    <Input
                      value={productForm.name}
                      onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Preço (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
                    <Input
                      value={productForm.description}
                      onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Descrição do produto"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Categoria</label>
                    <select
                      value={productForm.category_id}
                      onChange={e => setProductForm(f => ({ ...f, category_id: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Imagem</label>
                    <div className="flex gap-2">
                      <label className="flex-1 h-10 rounded-md border border-input bg-background px-3 flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:bg-muted transition-colors">
                        <Upload className="w-4 h-4" />
                        {imageFile ? imageFile.name : 'Escolher imagem'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProductForm(f => ({ ...f, is_popular: !f.is_popular }))}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                        productForm.is_popular
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      )}
                    >
                      {productForm.is_popular ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                      <span className="text-sm">{productForm.is_popular ? 'Popular' : 'Normal'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleProductSubmit} className="gradient-burger text-primary-foreground">
                    <Save className="w-4 h-4 mr-2" /> {editingProduct ? 'Salvar' : 'Criar'}
                  </Button>
                  <Button variant="outline" onClick={resetProductForm}>Cancelar</Button>
                </div>
              </div>
            )}

            {/* Product List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden group">
                  <div className="h-40 bg-muted flex items-center justify-center">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-foreground line-clamp-1">{p.name}</h4>
                      {p.is_popular && (
                        <Star className="w-4 h-4 text-primary flex-shrink-0 fill-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-primary font-bold">{formatPrice(Number(p.price))}</span>
                        <span className="text-xs text-muted-foreground ml-2">{getCategoryName(p.category_id)}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => editProduct(p)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum produto cadastrado</p>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
              <Button onClick={() => { resetCategoryForm(); setShowCategoryForm(true); }} className="gradient-burger text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Nova Categoria
              </Button>
            </div>

            {showCategoryForm && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={resetCategoryForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Nome</label>
                    <Input
                      value={categoryForm.name}
                      onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nome da categoria"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Slug</label>
                    <Input
                      value={categoryForm.slug}
                      onChange={e => setCategoryForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="slug-da-categoria"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Ícone (Lucide)</label>
                    <select
                      value={categoryForm.icon}
                      onChange={e => setCategoryForm(f => ({ ...f, icon: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleCategorySubmit} className="gradient-burger text-primary-foreground">
                    <Save className="w-4 h-4 mr-2" /> {editingCategory ? 'Salvar' : 'Criar'}
                  </Button>
                  <Button variant="outline" onClick={resetCategoryForm}>Cancelar</Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{c.name}</h4>
                    <p className="text-sm text-muted-foreground">/{c.slug} · {c.icon}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => editCategory(c)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCategory(c.id)} className="hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPSELLS TAB */}
        {activeTab === 'upsells' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Ofertas Combo</h2>
                <p className="text-sm text-muted-foreground">
                  Configure ofertas tipo "Leve também" que aparecem quando o cliente adiciona um produto
                </p>
              </div>
              <Button onClick={() => { resetUpsellForm(); setShowUpsellForm(true); }} className="gradient-burger text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Nova Oferta
              </Button>
            </div>

            {showUpsellForm && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {editingUpsell ? 'Editar Oferta' : 'Nova Oferta'}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={resetUpsellForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Produto principal</label>
                    <select
                      value={upsellForm.product_id}
                      onChange={e => setUpsellForm(f => ({ ...f, product_id: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Selecione o produto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {formatPrice(Number(p.price))}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Produto adicional (oferta)</label>
                    <select
                      value={upsellForm.upsell_product_id}
                      onChange={e => setUpsellForm(f => ({ ...f, upsell_product_id: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Selecione o produto adicional...</option>
                      {products.filter(p => p.id !== upsellForm.product_id).map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {formatPrice(Number(p.price))}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Preço extra (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={upsellForm.extra_price}
                      onChange={e => setUpsellForm(f => ({ ...f, extra_price: e.target.value }))}
                      placeholder="Ex: 10.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Valor que o cliente paga a mais para levar este item</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Texto da oferta</label>
                    <Input
                      value={upsellForm.label}
                      onChange={e => setUpsellForm(f => ({ ...f, label: e.target.value }))}
                      placeholder='Ex: "+ R$10 leve outro Classic"'
                    />
                    <p className="text-xs text-muted-foreground mt-1">Texto que aparece para o cliente</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleUpsellSubmit} className="gradient-burger text-primary-foreground">
                    <Save className="w-4 h-4 mr-2" /> {editingUpsell ? 'Salvar' : 'Criar'}
                  </Button>
                  <Button variant="outline" onClick={resetUpsellForm}>Cancelar</Button>
                </div>
              </div>
            )}

            {/* Upsells List */}
            <div className="space-y-3">
              {upsells.map(u => (
                <div key={u.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{getProductName(u.product_id)}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-primary font-medium">{getProductName(u.upsell_product_id)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        + {formatPrice(Number(u.extra_price))}
                      </span>
                      <span className="text-sm text-muted-foreground">"{u.label}"</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => editUpsell(u)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteUpsell(u.id)} className="hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {upsells.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma oferta combo cadastrada</p>
                <p className="text-sm mt-1">Crie ofertas para sugerir produtos adicionais aos clientes</p>
              </div>
            )}
          </div>
        )}

        {/* PROMOTIONS TAB */}
        {activeTab === 'promotions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Promoções</h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie as promoções exibidas na página de promoções
                </p>
              </div>
              <Button onClick={() => { resetPromoForm(); setShowPromoForm(true); }} className="gradient-burger text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Nova Promoção
              </Button>
            </div>

            {showPromoForm && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {editingPromo ? 'Editar Promoção' : 'Nova Promoção'}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={resetPromoForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Título</label>
                    <Input
                      value={promoForm.title}
                      onChange={e => setPromoForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Ex: Combo Duplo"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Válido até</label>
                    <Input
                      value={promoForm.valid_until}
                      onChange={e => setPromoForm(f => ({ ...f, valid_until: e.target.value }))}
                      placeholder="Ex: Hoje, 17h-19h"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
                    <Input
                      value={promoForm.description}
                      onChange={e => setPromoForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Descrição da promoção"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Preço original (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={promoForm.original_price}
                      onChange={e => setPromoForm(f => ({ ...f, original_price: e.target.value }))}
                      placeholder="79.60"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Preço promocional (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={promoForm.promo_price}
                      onChange={e => setPromoForm(f => ({ ...f, promo_price: e.target.value }))}
                      placeholder="59.90"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground mb-1 block">Itens incluídos (um por linha)</label>
                    <textarea
                      value={promoForm.items}
                      onChange={e => setPromoForm(f => ({ ...f, items: e.target.value }))}
                      placeholder={"2x X-Burguer Clássico\n2x Refrigerante Lata\n1x Batata Grande"}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Imagem</label>
                    <label className="flex-1 h-10 rounded-md border border-input bg-background px-3 flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:bg-muted transition-colors">
                      <Upload className="w-4 h-4" />
                      {promoImageFile ? promoImageFile.name : 'Escolher imagem'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => setPromoImageFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPromoForm(f => ({ ...f, is_active: !f.is_active }))}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                        promoForm.is_active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      )}
                    >
                      <span className="text-sm">{promoForm.is_active ? '✅ Ativa' : '❌ Inativa'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handlePromoSubmit} className="gradient-burger text-primary-foreground">
                    <Save className="w-4 h-4 mr-2" /> {editingPromo ? 'Salvar' : 'Criar'}
                  </Button>
                  <Button variant="outline" onClick={resetPromoForm}>Cancelar</Button>
                </div>
              </div>
            )}

            {/* Promotions List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotions.map(p => (
                <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden group">
                  <div className="h-40 bg-muted flex items-center justify-center relative">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <Tag className="w-12 h-12 text-muted-foreground/30" />
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="gradient-acai text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        {Math.round((1 - Number(p.promo_price) / Number(p.original_price)) * 100)}% OFF
                      </span>
                    </div>
                    {!p.is_active && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                          Inativa
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground line-clamp-1 mb-1">{p.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground line-through mr-2">{formatPrice(Number(p.original_price))}</span>
                        <span className="text-primary font-bold">{formatPrice(Number(p.promo_price))}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => editPromo(p)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePromo(p.id)} className="hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {promotions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma promoção cadastrada</p>
                <p className="text-sm mt-1">Crie promoções para atrair mais clientes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
