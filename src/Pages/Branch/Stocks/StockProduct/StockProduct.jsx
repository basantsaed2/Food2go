// src/pages/StockProduct.jsx
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Table } from '@/components/ui/table';
import { Link, useNavigate } from 'react-router-dom';
import { useGet } from '@/hooks/useGet';
import { useDelete } from '@/hooks/useDelete';
import { useChangeState } from '@/hooks/useChangeState';
import DeleteDialog from '@/components/DeleteDialog';
import FullPageLoader from '@/components/Loading';
import { FaPlus } from 'react-icons/fa';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

const StockProduct = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // FETCH PRODUCTS
  const {
    data,
    isLoading: loadingProducts,
    isError,
    error,
  } = useGet({
    url: `${apiUrl}/branch/purchase_product`,
    queryKey: QUERY_KEYS.PRODUCTS,
  });

  // MUTATIONS
  const { deleteData, loadingDelete } = useDelete(QUERY_KEYS.PRODUCTS);
  const { changeState, loadingChange } = useChangeState(QUERY_KEYS.PRODUCTS);

  // LOCAL STATE
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // FORMAT DATA - Updated for products
  const products = data?.products?.map((product) => ({
    id: product.id,
    name: product.name || '—',
    description: product.description || '—',
    category: product.category || '—',
    category_id: product.category_id,
    status: product.status ? 'Active' : 'Inactive',
    rawStatus: product.status,
  })) || [];

  // HANDLERS
  const handleStatusChange = (id, newStatus) => {
    const url = `${apiUrl}/branch/purchase_product/status/${id}?status=${newStatus ? 1 : 0}`;
    changeState({
      url,
      successMessage: `${newStatus ? 'Activated' : 'Deactivated'} Successfully`,
    });
  };

  const handleEdit = (item) => {
    navigate(`edit/${item.id}`, { state: { itemData: item } });
  };

  const handleDelete = (item) => {
    setSelectedRow(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedRow) return;
    deleteData({
      url: `${apiUrl}/branch/purchase_product/delete/${selectedRow.id}`,
      successMessage: `${selectedRow.name} Deleted Successfully`,
    });
    setIsDeleteOpen(false);
    setSelectedRow(null);
  };

  // COLUMNS - Updated for products
  const Columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' },
    {
      key: 'status',
      label: 'Status',
      renderCell: (item) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={item.rawStatus}
            onCheckedChange={(checked) => handleStatusChange(item.id, checked)}
            disabled={loadingChange}
          />
          <span className={item.rawStatus ? 'text-green-600' : 'text-red-600'}>
            {item.status}
          </span>
        </div>
      ),
    },
  ];

  // ERROR UI
  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Failed to load products.</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS })}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-bg-primary">Products</h2> {/* Updated title */}
        <Link
          to="add"
          className="flex items-center gap-2 px-4 py-1 rounded-md bg-bg-primary text-white font-semibold hover:bg-bg-primary/90"
        >
          <FaPlus className="h-3 w-3" /> Add Product {/* Updated button text */}
        </Link>
      </div>

      {loadingProducts ? (
        <FullPageLoader />
      ) : (
        <Table
          data={products}
          columns={Columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          className="w-full rounded-lg shadow-md p-6"
        />
      )}

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDelete={handleDeleteConfirm}
        name={selectedRow?.name}
        isLoading={loadingDelete}
      />
    </div>
  );
};

export default StockProduct;