import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi } from '../services/inventory-api';
import type { Product } from '../types';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts(value = search) {
    setLoading(true);
    setError('');
    try {
      setProducts(await inventoryApi.listProducts(value));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    inventoryApi.listProducts('').then((loadedProducts) => {
      if (!cancelled) setProducts(loadedProducts);
    }).catch((cause) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="inventory-page">
      <div className="page-heading">
        <div><span className="eyebrow">Inventario</span><h2>Productos</h2><p>Administra el catálogo que utilizarás en tus entradas de inventario.</p></div>
        <Link className="button button--primary" to="/inventory/products/new">＋ Nuevo producto</Link>
      </div>
      <div className="catalog-toolbar">
        <label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void loadProducts(); }} placeholder="Buscar por código o nombre" /></label>
        <button className="button button--secondary" type="button" onClick={() => void loadProducts()}>Buscar</button>
      </div>
      {error && <div className="alert alert--error" role="alert">{error}</div>}
      <div className="catalog-card">
        {loading ? <div className="empty-state">Cargando catálogo…</div> : products.length === 0 ? <div className="empty-state"><strong>No hay productos todavía</strong><span>Registra el primero para comenzar tu catálogo.</span><Link className="button button--primary" to="/inventory/products/new">Registrar producto</Link></div> : (
          <div className="product-table-wrap"><table className="product-table"><thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Marca</th><th>Precio unitario</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><span className="code-pill">{product.code}</span></td><td><strong>{product.name}</strong>{product.description && <small>{product.description}</small>}</td><td>{product.category.name}</td><td>{product.brand.name}</td><td className="price-cell">${Number(product.unitPrice).toFixed(2)}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </section>
  );
}
