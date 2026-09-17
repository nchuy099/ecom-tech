import React, { useState } from 'react';
import { Plus, Trash2, Search, Package, Check, AlertCircle } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../services/mockData';
import { ProductSummaryResponse } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductSummaryResponse[]>([...MOCK_PRODUCTS]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { addToast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [variantName, setVariantName] = useState('');
  const [price, setPrice] = useState<number>(10000000);
  const [categoryId, setCategoryId] = useState(MOCK_CATEGORIES[0].id);
  const [quantity, setQuantity] = useState<number>(50);

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      addToast('error', 'Thiếu dữ liệu', 'Vui lòng nhập tên sản phẩm và mã SKU.');
      return;
    }

    const newProd: ProductSummaryResponse = {
      id: `prod-${Date.now()}`,
      name,
      categoryId,
      categoryName: MOCK_CATEGORIES.find(c => c.id === categoryId)?.name,
      active: true,
      variantId: `var-${Date.now()}`,
      sku: sku.toUpperCase(),
      variantName: variantName || 'Bản Tiêu Chuẩn',
      price,
      availableQuantity: quantity,
      reservedQuantity: 0,
      imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80',
    };

    setProducts(prev => [newProd, ...prev]);
    setIsAddModalOpen(false);
    addToast('success', 'Thêm sản phẩm mới thành công!', `SKU: ${sku.toUpperCase()}`);

    // Reset form
    setName('');
    setSku('');
    setVariantName('');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast('info', 'Đã xóa sản phẩm khỏi catalog');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Quản Lý Sản Phẩm & Biến Thể (Catalog)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Thêm mới sản phẩm, quản lý mã SKU và đồng bộ tồn kho với backend Java.
          </p>
        </div>

        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Thêm Sản Phẩm Mới
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã SKU..."
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
          />
        </div>
        <span className="text-xs text-zinc-400">
          Tổng cộng: <span className="font-bold text-zinc-900 dark:text-zinc-100">{filteredProducts.length}</span> sản phẩm
        </span>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 uppercase font-mono tracking-wider text-[10px] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">Sản Phẩm</th>
              <th className="py-3 px-4">Mã SKU</th>
              <th className="py-3 px-4">Ngành Hàng</th>
              <th className="py-3 px-4">Giá Bán</th>
              <th className="py-3 px-4">Tồn Khả Dụng</th>
              <th className="py-3 px-4">Tạm Giữ</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{p.name}</p>
                      <p className="text-[11px] text-zinc-400">{p.variantName}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                  {p.sku}
                </td>
                <td className="py-3 px-4 text-zinc-500">{p.categoryName || 'Thiết bị'}</td>
                <td className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">
                  {formatCurrency(p.price)}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px]">
                    {p.availableQuantity} sp
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[11px]">
                    {p.reservedQuantity} sp
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tạo Sản Phẩm & Biến Thể Mới"
        description="Mô phỏng endpoint POST /api/v1/admin/products"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            label="Tên sản phẩm"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ví dụ: Bàn phím cơ không dây MX Pro"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Mã SKU Biến thể"
              value={sku}
              onChange={e => setSku(e.target.value)}
              placeholder="VD: MX-PRO-WIRELESS"
              required
            />
            <Input
              label="Tên biến thể"
              value={variantName}
              onChange={e => setVariantName(e.target.value)}
              placeholder="VD: Màu xám / Switch Đỏ"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                Ngành hàng
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                {MOCK_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Giá bán (VND)"
              type="number"
              step={100000}
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              required
            />
            <Input
              label="Số lượng nhập kho"
              type="number"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button size="sm" type="submit">
              Lưu Sản Phẩm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
