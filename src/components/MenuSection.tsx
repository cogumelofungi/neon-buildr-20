import { useState, useMemo } from 'react';
import { useCategories, useProducts } from '@/hooks/use-products';
import CategoryButton from './CategoryButton';
import MenuItemCard from './MenuItemCard';
import { Loader2 } from 'lucide-react';

const MenuSection = () => {
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: products = [], isLoading: prodLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Set first category as active once loaded
  const activeCat = activeCategory ?? categories[0]?.id ?? null;

  const filteredItems = useMemo(() => {
    if (!activeCat) return [];
    return products.filter((item) => item.category_id === activeCat);
  }, [activeCat, products]);

  const isLoading = catLoading || prodLoading;

  return (
    <section id="menu" className="py-16 px-4">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Nosso <span className="text-gradient-burger">Cardápio</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Escolha entre nossos deliciosos hambúrgueres artesanais e açaís cremosos
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  name={category.name}
                  icon={category.icon}
                  isActive={activeCat === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <MenuItemCard key={item.id} item={item} index={index} />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Nenhum item encontrado nesta categoria.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
