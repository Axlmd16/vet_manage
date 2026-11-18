import { useEffect, useState } from 'react';
import { inventoryApi } from '../services/inventory-api';
import type { CatalogItem } from '../types';

export function CatalogPage({ type }: { type: 'category' | 'brand' }) {
  const label = type === 'category' ? 'Categorías' : 'Marcas';
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { void (type === 'category' ? inventoryApi.listCategories() : inventoryApi.listBrands()).then(setItems); }, [type]);
  async function create() { if (name.trim().length < 2) return; const item = type === 'category' ? await inventoryApi.createCategory(name) : await inventoryApi.createBrand(name); setItems((current) => [...current, item].sort((a, b) => a.name.localeCompare(b.name))); setName(''); setNotice(`${type === 'category' ? 'Categoría' : 'Marca'} creada correctamente`); }
  return <section className="inventory-page"><div className="page-heading"><div><span className="eyebrow">Inventario</span><h2>{label}</h2><p>Administra las opciones disponibles para clasificar tus productos.</p></div></div><div className="catalog-card catalog-manager"><div className="manager-form"><label className="field"><span>Nueva {type === 'category' ? 'categoría' : 'marca'}</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Escribe un nombre" /></label><button className="button button--primary" type="button" onClick={() => void create()}>Agregar</button></div>{notice && <div className="alert alert--success">{notice}</div>}<div className="simple-list">{items.map((item) => <div className="simple-list__item" key={item.id}><span className="list-icon">{type === 'category' ? '◈' : '✦'}</span><strong>{item.name}</strong></div>)}</div></div></section>;
}
