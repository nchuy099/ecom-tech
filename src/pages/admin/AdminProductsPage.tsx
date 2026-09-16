import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Search, Upload, Link as LinkIcon } from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';
import { CategoryResponse, ProductSummaryResponse, WarehouseResponse } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { addToast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [variantName, setVariantName] = useState('');
  const [price, setPrice] = useState<number>(10000000);
  const [categoryId, setCategoryId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState<number>(50);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = () => {
    ecommerceService.getProducts({ size: 100 }).then(page => setProducts(page.items));
  };

  useEffect(() => {
    loadProducts();

    ecommerceService.getCategories().then(data => {
      setCategories(data);
      setCategoryId(current => current || data[0]?.id || '');
    });

    ecommerceService.getWarehouses().then(data => {
      setWarehouses(data);
      setWarehouseId(current => current || data[0]?.id || '');
    });
  }, []);

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasImage = imageMode === 'url' ? Boolean(imageUrl.trim()) : Boolean(imageFile);
    if (!name.trim() || !sku.trim() || !categoryId || !warehouseId || !hasImage) {
      addToast('error', 'Thiếu dữ liệu', 'Vui lòng nhập đủ sản phẩm, SKU, ngành hàng, kho và ảnh.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedImage =
        imageMode === 'upload' && imageFile
          ? await ecommerceService.uploadProductImage(imageFile)
          : await ecommerceService.importProductImage(imageUrl.trim());

      const product = await ecommerceService.createProduct({
        categoryId,
        name,
        description: 'Sản phẩm được tạo từ màn quản trị React.',
      });

      const variant = await ecommerceService.createVariant(product.id, {
        sku: sku.toUpperCase(),
        name: variantName || 'Bản Tiêu Chuẩn',
        price,
        imageUrl: uploadedImage.imageUrl,
      });

      await ecommerceService.upsertInventory(warehouseId, variant.id, quantity);
      loadProducts();
      setIsAddModalOpen(false);
      addToast('success', 'Thêm sản phẩm mới thành công!', `SKU: ${sku.toUpperCase()}`);

      setName('');
      setSku('');
      setVariantName('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
      setImageMode('url');
    } catch (err: any) {
      addToast('error', 'Không thể thêm sản phẩm', err.message || 'Lỗi hệ thống');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageFileChange = (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      addToast('error', 'Ảnh không hợp lệ', 'Chỉ hỗ trợ JPEG, PNG, WebP hoặc AVIF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'Ảnh quá lớn', 'Dung lượng ảnh tối đa là 10 MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await ecommerceService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast('info', 'Đã xóa sản phẩm khỏi catalog');
    } catch (err: any) {
      addToast('error', 'Không thể xóa sản phẩm', err.message || 'Lỗi hệ thống');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Quản Lý Sản Phẩm & Biến Thể (Catalog)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Thêm mới sản phẩm, quản lý mã SKU và cập nhật tồn kho cho từng kho.
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
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative w-full sm:max-w-sm">
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
        <table className="responsive-table w-full text-left text-xs">
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
                <td data-label="Sản phẩm" className="py-3 px-4">
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
                <td data-label="Mã SKU" className="py-3 px-4 font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                  {p.sku}
                </td>
                <td data-label="Ngành hàng" className="py-3 px-4 text-zinc-500">{p.categoryName || 'Thiết bị'}</td>
                <td data-label="Giá bán" className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">
                  {formatCurrency(p.price)}
                </td>
                <td data-label="Tồn khả dụng" className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px]">
                    {p.availableQuantity} sp
                  </span>
                </td>
                <td data-label="Tạm giữ" className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[11px]">
                    {p.reservedQuantity} sp
                  </span>
                </td>
                <td data-label="Thao tác" className="py-3 px-4 text-right">
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
        description="Nhập thông tin sản phẩm, biến thể và số lượng tồn kho ban đầu"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            label="Tên sản phẩm"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ví dụ: Bàn phím cơ không dây MX Pro"
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
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

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                Ngành hàng
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                {categories.map(c => (
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
              Ảnh sản phẩm <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  imageMode === 'url'
                    ? 'bg-white text-brand-600 shadow-sm dark:bg-zinc-700 dark:text-brand-300'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                URL ảnh
              </button>
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  imageMode === 'upload'
                    ? 'bg-white text-brand-600 shadow-sm dark:bg-zinc-700 dark:text-brand-300'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload lên R2
              </button>
            </div>
            {imageMode === 'url' ? (
              <Input
                value={imageUrl}
                onChange={e => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                type="url"
                placeholder="https://example.com/product-image.jpg"
                helperText="Backend sẽ tải ảnh về và lưu bản copy trên Cloudflare R2."
                required
              />
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center transition-colors hover:border-brand-500 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-brand-400 dark:hover:bg-brand-950/20">
                <Upload className="h-5 w-5 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  {imageFile ? imageFile.name : 'Chọn ảnh công nghệ để upload lên R2'}
                </span>
                <span className="text-[11px] text-zinc-500">JPEG, PNG, WebP hoặc AVIF · tối đa 10 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  onChange={e => handleImageFileChange(e.target.files?.[0])}
                  required={!imageFile}
                />
              </label>
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Xem trước ảnh sản phẩm"
                className="h-32 w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
                onError={() => setImagePreview('')}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
              Kho nhập ban đầu
            </label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:justify-end">
            <Button className="w-full sm:w-auto" variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button className="w-full sm:w-auto" size="sm" type="submit" isLoading={isSubmitting}>
              Lưu Sản Phẩm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
