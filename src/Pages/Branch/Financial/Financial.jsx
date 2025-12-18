import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Table } from '@/components/ui/table';
import { Link, useNavigate } from 'react-router-dom';
import { useGet } from '@/hooks/useGet';
import { useDelete } from '@/hooks/useDelete';
import { useChangeState } from '@/hooks/useChangeState';
import DeleteDialog from '@/components/DeleteDialog';
import FullPageLoader from '@/components/Loading';
import { FaPlus, FaSignOutAlt, FaUser, FaCashRegister, FaClock, FaIdBadge } from 'react-icons/fa';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

// shadcn/ui components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Financial = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // STATE
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [loadingSwitches, setLoadingSwitches] = useState({});

    const { data, isLoading: loadingFinancial, isError, error } = useGet({
        url: `${apiUrl}/branch/financial`,
        queryKey: QUERY_KEYS.FINANCIAL,
    });

    const { deleteData, loadingDelete } = useDelete(QUERY_KEYS.FINANCIAL);
    const { changeState, loadingChange } = useChangeState(QUERY_KEYS.FINANCIAL);

    const financialData = data?.financials?.map((financial) => ({
        id: financial.id,
        img: financial.logo_link,
        logo: financial.logo,
        name: financial.name || '—',
        details: financial.details || '—',
        description_status: financial.description_status === 1 ? 'Active' : 'Inactive',
        discount: financial.discount === 1 ? 'Active' : 'Inactive',
        status: financial.status === 1 ? 'Active' : 'Inactive',
        rawStatus: financial.status === 1,
    })) || [];

    const handleStatusChange = async (id, newStatus) => {
        if (loadingSwitches[id]) return;
        setLoadingSwitches(prev => ({ ...prev, [id]: true }));
        try {
            await changeState({
                url: `${apiUrl}/branch/financial/status/${id}?status=${newStatus ? 1 : 0}`,
                successMessage: `Financial Account ${newStatus ? 'Activated' : 'Deactivated'} Successfully`
            });
            if (selectedRow?.id === id) {
                setSelectedRow(prev => ({ ...prev, status: newStatus ? 1 : 0 }));
            }
        } finally {
            setLoadingSwitches(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleEdit = (item) => navigate(`edit/${item.id}`, { state: { itemData: item } });

    const handleDelete = (item) => {
        setSelectedRow(item);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        // NOTE: Update this URL to your actual API for deleting a Cashier Position
        try {
            await deleteData({
                url: `${apiUrl}/branch/financial/delete/${selectedRow.id}`,
                successMessage: `${selectedRow.name} Deleted Successfully`,
            });
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsDeleteOpen(false);
            setSelectedRow(null);
        }
    };

    const cashierColumns = [
        { key: 'img', label: 'Image' },
        { key: 'name', label: 'Name' },
        { key: 'details', label: 'Description' },
        { key: 'description_status', label: 'Visa Status' },
        { key: 'discount', label: 'Discount' },
        {
            key: "status",
            label: "Status",
            renderCell: (item) => (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={item.rawStatus}
                        onCheckedChange={(checked) => handleStatusChange(item.id, checked)}
                        disabled={loadingChange}
                    />
                    <span className={item.rawStatus ? "text-green-600" : "text-red-600"}>
                        {item.status}
                    </span>
                </div>
            )
        },
    ];

    if (isError) {
        return (
            <div className="p-4">
                <div className="text-red-500 text-center p-4">
                    <h3 className="text-lg font-semibold">Error Loading Financial Accounts</h3>
                    <p className="mt-2">{error?.message || 'Failed to load financial account data'}</p>
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FINANCIAL })}
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
                <h2 className="text-2xl font-bold text-bg-primary">Financial Account</h2>
                <Link
                    to="add"
                    className="flex items-center gap-2 px-4 py-1 rounded-md bg-bg-primary text-white font-semibold hover:bg-bg-primary/90"
                >
                    <FaPlus className="h-3 w-3" /> Add Financial Account
                </Link>
            </div>

            {loadingFinancial ? (
                <FullPageLoader />
            ) : (
                <Table
                    data={financialData}
                    columns={cashierColumns}
                    statusKey="discount"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    className="w-full"
                />
            )}

            {/* Delete Dialog */}
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

export default Financial;