// src/pages/Stock.jsx
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

const Stock = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // FETCH STOCKS
  const {
    data,
    isLoading: loadingStockes,
    isError,
    error,
  } = useGet({
    url: `${apiUrl}/branch/purchase_stores`,
    queryKey: QUERY_KEYS.STOCKS,
  });

  // MUTATIONS
  const { deleteData, loadingDelete } = useDelete(QUERY_KEYS.STOCKS);
  const { changeState, loadingChange } = useChangeState(QUERY_KEYS.STOCKS);

  // LOCAL STATE
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // FORMAT DATA
  const stocks = data?.stores?.map((u) => ({
    id: u.id,
    name: u.name || '—',
    status: u.status ? 'Active' : 'Inactive',
    rawStatus: u.status,
    location: u.location,
    branches: u.branches || [],
  })) || [];

  // HANDLERS
  const handleStatusChange = (id, newStatus) => {
    const url = `${apiUrl}/branch/purchase_stores/status/${id}?status=${newStatus ? 1 : 0}`;
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
      url: `${apiUrl}/branch/purchase_stores/delete/${selectedRow.id}`,
      successMessage: `${selectedRow.name} Deleted Successfully`,
    });
    setIsDeleteOpen(false);
    setSelectedRow(null);
  };

  // COLUMNS
  const Columns = [
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Area' },
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
        <p className="text-red-600">Failed to load stocks.</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCKS })}
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
        <h2 className="text-2xl font-bold text-bg-primary">Stock</h2>
        <Link
          to="add"
          className="flex items-center gap-2 px-4 py-1 rounded-md bg-bg-primary text-white font-semibold hover:bg-bg-primary/90"
        >
          <FaPlus className="h-3 w-3" /> Add
        </Link>
      </div>

      {loadingStockes ? (
        <FullPageLoader />
      ) : (
        <Table
          data={stocks}
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

export default Stock;