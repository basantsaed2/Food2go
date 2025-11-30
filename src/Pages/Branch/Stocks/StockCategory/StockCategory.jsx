// src/pages/StockCategory.jsx
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

const StockCategory = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // FETCH CATEGORIES
  const {
    data,
    isLoading: loadingCategories,
    isError,
    error,
  } = useGet({
    url: `${apiUrl}/branch/purchase_categories`,
    queryKey: QUERY_KEYS.CATEGORIES,
  });

  // MUTATIONS
  const { deleteData, loadingDelete } = useDelete(QUERY_KEYS.CATEGORIES);
  const { changeState, loadingChange } = useChangeState(QUERY_KEYS.CATEGORIES);

  // LOCAL STATE
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loadingSwitches, setLoadingSwitches] = useState({});
  const [activeTab, setActiveTab] = useState('parent'); // 'parent' or 'sub'

  // FORMAT DATA - Keep separate
  const parentCategories = data?.parent_categories?.map((category) => ({
    id: category.id,
    name: category.name || '—',
    status: category.status ? 'Active' : 'Inactive',
    rawStatus: category.status,
    type: 'parent',
  })) || [];

  const subCategories = data?.sub_categories?.map((category) => ({
    id: category.id,
    name: category.name || '—',
    category_id: category.category_id,
    parent_category: category.category || '—',
    status: category.status ? 'Active' : 'Inactive',
    rawStatus: category.status,
    type: 'sub',
  })) || [];

  // Get current data based on active tab
  const currentData = activeTab === 'parent' ? parentCategories : subCategories;

  // HANDLERS
  const handleStatusChange = async (id, newStatus) => {
    if (loadingSwitches[id]) return;

    setLoadingSwitches(prev => ({ ...prev, [id]: true }));

    const url = `${apiUrl}/branch/purchase_categories/status/${id}?status=${newStatus ? 1 : 0}`;
    const successMessage = `${newStatus ? 'Activated' : 'Deactivated'} Successfully`;

    try {
      await changeState({
        url,
        successMessage,
      });
    } catch (error) {
      console.error('Status change failed:', error);
    } finally {
      setLoadingSwitches(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleEdit = (item) => {
    navigate(`edit/${item.id}`, { state: { itemData: item } });
  };

  const handleDelete = (item) => {
    setSelectedRow(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    try {
      await deleteData({
        url: `${apiUrl}/branch/purchase_categories/delete/${selectedRow.id}`,
        successMessage: `${selectedRow.name} Deleted Successfully`,
      });
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleteOpen(false);
      setSelectedRow(null);
    }
  };

  // COLUMNS - Different columns for parent and sub categories
  const parentColumns = [
    { key: 'name', label: 'Category Name' },
    {
      key: 'status',
      label: 'Status',
      renderCell: (item) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={item.rawStatus}
            onCheckedChange={(checked) => handleStatusChange(item.id, checked)}
            disabled={loadingSwitches[item.id] || loadingChange}
          />
          <span className={item.rawStatus ? 'text-green-600' : 'text-red-600'}>
            {loadingSwitches[item.id] ? 'Updating...' : item.status}
          </span>
        </div>
      ),
    },
  ];

  const subColumns = [
    { key: 'name', label: 'Sub Category Name' },
    { key: 'parent_category', label: 'Parent Category' },
    {
      key: 'status',
      label: 'Status',
      renderCell: (item) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={item.rawStatus}
            onCheckedChange={(checked) => handleStatusChange(item.id, checked)}
            disabled={loadingSwitches[item.id] || loadingChange}
          />
          <span className={item.rawStatus ? 'text-green-600' : 'text-red-600'}>
            {loadingSwitches[item.id] ? 'Updating...' : item.status}
          </span>
        </div>
      ),
    },
  ];

  const currentColumns = activeTab === 'parent' ? parentColumns : subColumns;

  // ERROR UI
  if (isError) {
    return (
      <div className="p-4">
        <div className="text-red-500 text-center p-4">
          <h3 className="text-lg font-semibold">Error Loading Categories</h3>
          <p className="mt-2">{error?.message || 'Failed to load categories data'}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-bg-primary">Categories</h2>
        <Link
          to="add"
          className="flex items-center gap-2 px-4 py-1 rounded-md bg-bg-primary text-white font-semibold hover:bg-bg-primary/90"
        >
          <FaPlus className="h-3 w-3" /> Add Category
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('parent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'parent'
                ? 'border-bg-primary text-bg-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Main Categories ({parentCategories.length})
          </button>
          <button
            onClick={() => setActiveTab('sub')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'sub'
                ? 'border-bg-primary text-bg-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Sub Categories ({subCategories.length})
          </button>
        </nav>
      </div>

      {loadingCategories ? (
        <FullPageLoader />
      ) : (
        <Table
          data={currentData}
          columns={currentColumns}
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

export default StockCategory;