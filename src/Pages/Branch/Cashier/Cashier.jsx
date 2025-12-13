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

const Cashier = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // FETCH CASHIER DATA
    // The data should contain the structure: { "cashiers": [...] }
    const {
        data,
        isLoading: loadingCashiers,
        isError,
        error,
    } = useGet({
        url: `${apiUrl}/branch/cashier`,
        queryKey: QUERY_KEYS.CASHIERS, // Changed to a specific CASHIERS key
    });

    // MUTATIONS
    // NOTE: URLs here must be updated based on actual Cashier API endpoints
    const { deleteData, loadingDelete } = useDelete(QUERY_KEYS.CASHIERS);
    const { changeState, loadingChange } = useChangeState(QUERY_KEYS.CASHIERS);

    // LOCAL STATE
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [loadingSwitches, setLoadingSwitches] = useState({});

    // FORMAT DATA
    const cashierData = data?.cashiers?.map((cashier) => ({
        id: cashier.id,
        name: cashier.name || '—',
        // Status of the Cashier POSITION (status field in JSON)
        positionStatus: cashier.status,
        // Active status of the assigned cashier user (cashier_active field in JSON)
        isActive: cashier.cashier_active,
        assignedUser: cashier.cashier_man?.user_name || 'Unassigned',
        assignedUserId: cashier.cashier_man?.id || null,
    })) || [];

    // HANDLERS
    const handleStatusChange = async (id, newStatus) => {
        if (loadingSwitches[id]) return;

        setLoadingSwitches(prev => ({ ...prev, [id]: true }));

        // NOTE: This URL is hypothetical. Adjust to your actual API for changing Cashier STATUS.
        const url = `${apiUrl}/branch/cashier/status/${id}?status=${newStatus ? 1 : 0}`;
        const successMessage = `Cashier Position ${newStatus ? 'Activated' : 'Deactivated'} Successfully`;

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
        // NOTE: Update this path to your actual edit route for Cashiers
        navigate(`edit/${item.id}`, { state: { itemData: item } });
    };

    const handleDelete = (item) => {
        setSelectedRow(item);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        // NOTE: Update this URL to your actual API for deleting a Cashier Position
        try {
            await deleteData({
                url: `${apiUrl}/branch/cashier/delete/${selectedRow.id}`,
                successMessage: `${selectedRow.name} Deleted Successfully`,
            });
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsDeleteOpen(false);
            setSelectedRow(null);
        }
    };

    // COLUMNS - Designed for Cashier Positions
    const cashierColumns = [
        { key: 'name', label: 'Position Name' },
        { key: 'assignedUser', label: 'Assigned User' },
        {
            key: 'isActive',
            label: 'User Status',
            renderCell: (item) => (
                <span className={item.isActive ? 'text-green-600' : 'text-red-600'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'positionStatus',
            label: 'Position Status',
            renderCell: (item) => (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={item.positionStatus}
                        onCheckedChange={(checked) => handleStatusChange(item.id, checked)}
                        disabled={loadingSwitches[item.id] || loadingChange}
                    />
                    <span className={item.positionStatus ? 'text-green-600' : 'text-red-600'}>
                        {loadingSwitches[item.id] ? 'Updating...' : (item.positionStatus ? 'Available' : 'Unavailable')}
                    </span>
                </div>
            ),
        },
    ];

    // ERROR UI
    if (isError) {
        return (
            <div className="p-4">
                <div className="text-red-500 text-center p-4">
                    <h3 className="text-lg font-semibold">Error Loading Cashiers</h3>
                    <p className="mt-2">{error?.message || 'Failed to load cashier data'}</p>
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASHIERS })}
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
                <h2 className="text-2xl font-bold text-bg-primary">Cashier Positions</h2>
                <Link
                    to="add"
                    className="flex items-center gap-2 px-4 py-1 rounded-md bg-bg-primary text-white font-semibold hover:bg-bg-primary/90"
                >
                    <FaPlus className="h-3 w-3" /> Add Cashier Position
                </Link>
            </div>

            {/* Removed Tab Navigation */}

            {loadingCashiers ? (
                <FullPageLoader />
            ) : (
                <Table
                    data={cashierData}
                    columns={cashierColumns}
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

export default Cashier;