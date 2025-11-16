import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, ShoppingCart, TrendingUp, AlertCircle, Save, RefreshCw } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [kits, setKits] = useState([]);
  const [sales, setSales] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: '' });
  const [kitForm, setKitForm] = useState({ name: '', price: '', items: [] });
  const [saleForm, setSaleForm] = useState({ items: [], total: 0 });
  const [editingId, setEditingId] = useState(null);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulação de carregamento de dados locais
      const savedProducts = localStorage.getItem('products');
      const savedKits = localStorage.getItem('kits');
      const savedSales = localStorage.getItem('sales');

      setProducts(savedProducts ? JSON.parse(savedProducts) : [
        { id: 1, name: 'Camiseta', price: 45.00, stock: 50, type: 'product' },
        { id: 2, name: 'Moletom', price: 85.00, stock: 30, type: 'product' },
        { id: 3, name: 'Caneca', price: 25.00, stock: 100, type: 'product' },
      ]);
      
      setKits(savedKits ? JSON.parse(savedKits) : [
        { 
          id: 1, 
          name: 'Kit Boas-Vindas', 
          price: 95.00, 
          items: [
            { productId: 1, quantity: 1 },
            { productId: 3, quantity: 1 }
          ],
          type: 'kit' 
        },
      ]);
      
      setSales(savedSales ? JSON.parse(savedSales) : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = (newProducts, newKits, newSales) => {
    try {
      localStorage.setItem('products', JSON.stringify(newProducts || products));
      localStorage.setItem('kits', JSON.stringify(newKits || kits));
      localStorage.setItem('sales', JSON.stringify(newSales || sales));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar dados. Tente novamente.');
    }
  };

  // Funções de Produto
  const addProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.stock) {
      alert('Preencha todos os campos');
      return;
    }

    let newProducts;
    if (editingId) {
      newProducts = products.map(p => 
        p.id === editingId 
          ? { ...p, name: productForm.name, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) }
          : p
      );
      setEditingId(null);
    } else {
      const newProduct = {
        id: Date.now(),
        name: productForm.name,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        type: 'product'
      };
      newProducts = [...products, newProduct];
    }
    
    setProducts(newProducts);
    saveData(newProducts, kits, sales);
    setProductForm({ name: '', price: '', stock: '' });
  };

  const deleteProduct = (id) => {
    if (window.confirm('Deseja realmente excluir este produto?')) {
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      saveData(newProducts, kits, sales);
    }
  };

  const editProduct = (product) => {
    setProductForm({ name: product.name, price: product.price, stock: product.stock });
    setEditingId(product.id);
  };

  // Funções de Kit
  const addKitItem = (productId) => {
    const existing = kitForm.items.find(i => i.productId === parseInt(productId));
    if (existing) {
      setKitForm({
        ...kitForm,
        items: kitForm.items.map(i => 
          i.productId === parseInt(productId) 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      });
    } else {
      setKitForm({
        ...kitForm,
        items: [...kitForm.items, { productId: parseInt(productId), quantity: 1 }]
      });
    }
  };

  const removeKitItem = (productId) => {
    setKitForm({
      ...kitForm,
      items: kitForm.items.filter(i => i.productId !== productId)
    });
  };

  const addKit = () => {
    if (!kitForm.name || !kitForm.price || kitForm.items.length === 0) {
      alert('Preencha todos os campos e adicione pelo menos um produto');
      return;
    }

    const newKit = {
      id: Date.now(),
      name: kitForm.name,
      price: parseFloat(kitForm.price),
      items: kitForm.items,
      type: 'kit'
    };
    
    const newKits = [...kits, newKit];
    setKits(newKits);
    saveData(products, newKits, sales);
    setKitForm({ name: '', price: '', items: [] });
  };

  const deleteKit = (id) => {
    if (window.confirm('Deseja realmente excluir este kit?')) {
      const newKits = kits.filter(k => k.id !== id);
      setKits(newKits);
      saveData(products, newKits, sales);
    }
  };

  const getKitAvailableStock = (kit) => {
    let minStock = Infinity;
    for (const item of kit.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const availableForKit = Math.floor(product.stock / item.quantity);
        minStock = Math.min(minStock, availableForKit);
      }
    }
    return minStock === Infinity ? 0 : minStock;
  };

  // Funções de Venda
  const addToSale = (item, quantity = 1) => {
    const existing = saleForm.items.find(i => i.id === item.id && i.type === item.type);
    
    let available = 0;
    if (item.type === 'product') {
      available = item.stock;
    } else {
      available = getKitAvailableStock(item);
    }

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > available) {
        alert('Estoque insuficiente');
        return;
      }
      setSaleForm({
        ...saleForm,
        items: saleForm.items.map(i => 
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: newQty, subtotal: newQty * item.price }
            : i
        )
      });
    } else {
      if (quantity > available) {
        alert('Estoque insuficiente');
        return;
      }
      setSaleForm({
        ...saleForm,
        items: [...saleForm.items, {
          ...item,
          quantity,
          subtotal: quantity * item.price
        }]
      });
    }
  };

  const removeFromSale = (id, type) => {
    setSaleForm({
      ...saleForm,
      items: saleForm.items.filter(i => !(i.id === id && i.type === type))
    });
  };

  const completeSale = () => {
    if (saleForm.items.length === 0) {
      alert('Adicione itens à venda');
      return;
    }

    const newSale = {
      id: Date.now(),
      date: new Date().toLocaleString('pt-BR'),
      items: saleForm.items,
      total: saleForm.items.reduce((sum, item) => sum + item.subtotal, 0)
    };

    // Atualizar estoque
    let updatedProducts = [...products];
    saleForm.items.forEach(item => {
      if (item.type === 'product') {
        updatedProducts = updatedProducts.map(p => 
          p.id === item.id ? { ...p, stock: p.stock - item.quantity } : p
        );
      } else if (item.type === 'kit') {
        const kit = kits.find(k => k.id === item.id);
        kit.items.forEach(kitItem => {
          updatedProducts = updatedProducts.map(p => 
            p.id === kitItem.productId 
              ? { ...p, stock: p.stock - (kitItem.quantity * item.quantity) }
              : p
          );
        });
      }
    });

    const newSales = [newSale, ...sales];
    setProducts(updatedProducts);
    setSales(newSales);
    saveData(updatedProducts, kits, newSales);
    setSaleForm({ items: [], total: 0 });
    alert('Venda finalizada com sucesso!');
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-3 mb-2">
                <Package className="w-8 h-8" />
                Sistema de Vendas e Estoque
              </h1>
              <p className="text-gray-600">Entidade Estudantil</p>
            </div>
            {saving && (
              <div className="flex items-center gap-2 text-indigo-600">
                <Save className="w-5 h-5 animate-pulse" />
                <span className="text-sm">Salvando...</span>
              </div>
            )}
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total em Vendas</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalSales.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Produtos Cadastrados</p>
                <p className="text-2xl font-bold text-blue-600">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Kits Disponíveis</p>
                <p className="text-2xl font-bold text-purple-600">{kits.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex border-b">
            {['products', 'kits', 'sales', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'products' && 'Produtos'}
                {tab === 'kits' && 'Kits'}
                {tab === 'sales' && 'Nova Venda'}
                {tab === 'history' && 'Histórico'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Tab Produtos */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-indigo-900">
                    {editingId ? 'Editar Produto' : 'Adicionar Produto'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Nome do produto"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Preço"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Estoque"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={addProduct}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      {editingId ? 'Salvar' : 'Adicionar'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg">{product.name}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editProduct(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-600 mb-2">R$ {product.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          Estoque: {product.stock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Kits */}
            {activeTab === 'kits' && (
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-purple-900">Criar Kit</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Nome do kit"
                        value={kitForm.name}
                        onChange={(e) => setKitForm({ ...kitForm, name: e.target.value })}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Preço do kit"
                        value={kitForm.price}
                        onChange={(e) => setKitForm({ ...kitForm, price: e.target.value })}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Adicionar Produtos ao Kit:</label>
                      <select
                        onChange={(e) => addKitItem(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        value=""
                      >
                        <option value="">Selecione um produto</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {kitForm.items.length > 0 && (
                      <div className="bg-white rounded p-3 space-y-2">
                        <p className="font-medium text-sm">Produtos no kit:</p>
                        {kitForm.items.map(item => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <div key={item.productId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span>{product?.name} x {item.quantity}</span>
                              <button
                                onClick={() => removeKitItem(item.productId)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button
                      onClick={addKit}
                      className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Kit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kits.map(kit => {
                    const availableStock = getKitAvailableStock(kit);
                    return (
                      <div key={kit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg">{kit.name}</h4>
                          <button
                            onClick={() => deleteKit(kit.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mb-3">R$ {kit.price.toFixed(2)}</p>
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <p className="text-sm font-medium mb-2">Inclui:</p>
                          {kit.items.map(item => {
                            const product = products.find(p => p.id === item.productId);
                            return (
                              <p key={item.productId} className="text-sm text-gray-600">
                                • {product?.name} x {item.quantity}
                              </p>
                            );
                          })}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          availableStock > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          Disponível: {availableStock} kits
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab Nova Venda */}
            {activeTab === 'sales' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Produtos</h3>
                  {products.map(product => (
                    <div key={product.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-green-600 font-bold">R$ {product.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Estoque: {product.stock}</p>
                      </div>
                      <button
                        onClick={() => addToSale(product)}
                        disabled={product.stock === 0}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}

                  <h3 className="text-xl font-semibold mb-4 mt-6">Kits</h3>
                  {kits.map(kit => {
                    const available = getKitAvailableStock(kit);
                    return (
                      <div key={kit.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{kit.name}</h4>
                          <p className="text-green-600 font-bold">R$ {kit.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Disponível: {available}</p>
                        </div>
                        <button
                          onClick={() => addToSale(kit)}
                          disabled={available === 0}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          Adicionar
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gray-50 rounded-lg p-6 h-fit sticky top-6">
                  <h3 className="text-xl font-semibold mb-4">Carrinho</h3>
                  {saleForm.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum item adicionado</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4">
                        {saleForm.items.map(item => (
                          <div key={`${item.type}-${item.id}`} className="bg-white rounded p-3 flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity} x R$ {item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-green-600">R$ {item.subtotal.toFixed(2)}</p>
                              <button
                                onClick={() => removeFromSale(item.id, item.type)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4 mb-4">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>Total:</span>
                          <span className="text-green-600">
                            R$ {saleForm.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={completeSale}
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        Finalizar Venda
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab Histórico */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Histórico de Vendas</h3>
                {sales.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma venda realizada ainda</p>
                  </div>
                ) : (
                  sales.map(sale => (
                    <div key={sale.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">Venda #{sale.id}</p>
                          <p className="text-sm text-gray-600">{sale.date}</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">R$ {sale.total.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm mb-1">
                            <span>{item.name} x {item.quantity}</span>
                            <span className="font-medium">R$ {item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}