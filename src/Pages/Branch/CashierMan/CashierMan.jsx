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

const CashierMan = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // STATE
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [loadingSwitches, setLoadingSwitches] = useState({});
    const [loadingLogout, setLoadingLogout] = useState({}); // Tracks logout loading per cashier

    const { data, isLoading: loadingCashiers, isError, error } = useGet({
        url: `${apiUrl}/branch/cashier_man`,
        queryKey: QUERY_KEYS.CASHIER_MAN,
    });

    const { deleteData, loadingDelete } = useDelete(QUERY_KEYS.CASHIER_MAN);
    const { changeState, loadingChange } = useChangeState(QUERY_KEYS.CASHIER_MAN);

    const cashierData = data?.cashier_men?.map((cashierMan) => ({
        id: cashierMan.id,
        img: cashierMan.image_link,
        name: cashierMan.user_name || '—',
        cashier: cashierMan.cashier?.name || '—',
        shift_number: cashierMan.shift_number || '—',
        my_id: cashierMan.my_id,
        isLoggedIn: cashierMan.login,
        status: cashierMan.status,
        delivery: cashierMan.delivery,
        take_away: cashierMan.take_away,
        dine_in: cashierMan.dine_in,
        online_order: cashierMan.online_order,
        discount_perimission: cashierMan.discount_perimission,
        real_order: cashierMan.real_order,
        void_order: cashierMan.void_order,
        report: cashierMan.report,
    })) || [];

    // HANDLERS
    const handleView = (item) => {
        setSelectedRow(item);
        setIsViewOpen(true);
    };

    const handleLogout = async (id) => {
        setLoadingLogout(prev => ({ ...prev, [id]: true }));
        try {
            await changeState({
                url: `${apiUrl}/branch/cashier_man/logout/${id}`,
                successMessage: `Cashier logged out successfully`,
            });
            queryClient.invalidateQueries([QUERY_KEYS.CASHIER_MAN]);
            // Update local selectedRow to reflect logout
            if (selectedRow?.id === id) {
                setSelectedRow(prev => ({ ...prev, isLoggedIn: false }));
            }
        } catch (err) {
            // Handle error if needed
        } finally {
            setLoadingLogout(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        if (loadingSwitches[id]) return;
        setLoadingSwitches(prev => ({ ...prev, [id]: true }));
        try {
            await changeState({
                url: `${apiUrl}/branch/cashier_man/status/${id}?status=${newStatus ? 1 : 0}`,
                successMessage: `Cashier Man ${newStatus ? 'Activated' : 'Deactivated'} Successfully`
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
                url: `${apiUrl}/branch/cashier_man/delete/${selectedRow.id}`,
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
        { key: 'my_id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'cashier', label: 'Cashier' },
        {
            key: 'isLoggedIn',
            label: 'Login Session',
            renderCell: (item) => (
                <div className="flex items-center gap-3">
                    <span className={`font-medium ${item.isLoggedIn ? 'text-blue-600' : 'text-gray-600'}`}>
                        {item.isLoggedIn ? 'Logged In' : 'Offline'}
                    </span>
                    {item.isLoggedIn && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleLogout(item.id)}
                            disabled={loadingLogout[item.id]}
                            className="h-8 px-3 bg-bg-primary hover:bg-bg-primary/90 shadow-lg text-xs flex items-center gap-1"
                        >
                            <FaSignOutAlt size={12} />
                            {loadingLogout[item.id] ? 'Logging out...' : 'Logout'}
                        </Button>
                    )}
                </div>
            ),
        },
        {
            key: 'positionStatus',
            label: 'Availability',
            renderCell: (item) => (
                <Switch
                    checked={item.status === 1}
                    onCheckedChange={(checked) => handleStatusChange(item.id, checked)}
                    disabled={loadingSwitches[item.id] || loadingChange}
                />
            ),
        },
    ];

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
                <h2 className="text-2xl font-bold text-bg-primary">Cashier Man</h2>
                <Link
                    to="add"
                    className="flex items-center gap-2 px-4 py-1 rounded-md bg-bg-primary text-white font-semibold hover:bg-bg-primary/90"
                >
                    <FaPlus className="h-3 w-3" /> Add Cashier Man
                </Link>
            </div>

            {loadingCashiers ? (
                <FullPageLoader />
            ) : (
                <Table
                    data={cashierData}
                    columns={cashierColumns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
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

            {/* Enhanced View Dialog with Logout Button */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="w-full bg-white rounded-xl shadow-2xl p-0 sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Gradient Header */}
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <FaUser className="h-6 w-6 text-blue-600" />
                                Cashier Profile
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-1">
                                Comprehensive details and permissions for the selected cashier
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedRow && (
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Profile Header with Avatar and Logout Button */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                                <div className="flex-shrink-0">
                                    <Avatar className="h-24 w-24 rounded-xl border-4 border-white shadow-lg">
                                        <AvatarImage
                                            src={selectedRow.img || '/placeholder-user.png'}
                                            alt={selectedRow.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-2xl font-bold">
                                            {selectedRow.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'CM'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedRow.name}</h2>
                                    <p className="text-lg text-gray-700 font-medium mb-3 flex items-center justify-center sm:justify-start gap-2">
                                        <FaIdBadge className="text-gray-500" />
                                        ID: {selectedRow.my_id}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                        {selectedRow.isLoggedIn && (
                                            <Badge className="bg-green-100 text-green-800">
                                                <FaSignOutAlt className="h-3 w-3 mr-1" />
                                                Currently Logged In
                                            </Badge>
                                        )}
                                        <Badge variant={selectedRow.status === 1 ? "default" : "secondary"}>
                                            {selectedRow.status === 1 ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Logout Button in Dialog */}
                                {selectedRow.isLoggedIn && (
                                    <div className="mt-4 sm:mt-0">
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleLogout(selectedRow.id)}
                                            disabled={loadingLogout[selectedRow.id]}
                                            className="flex bg-bg-primary shadow-lg items-center gap-2 px-4 py-2"
                                        >
                                            <FaSignOutAlt size={14} />
                                            {loadingLogout[selectedRow.id] ? 'Logging out...' : 'Logout'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                        Assignment Details
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <FaCashRegister className="h-4 w-4" />
                                                Assigned Cashier
                                            </p>
                                            <p className="text-gray-900 font-semibold mt-1 text-lg">
                                                {selectedRow.cashier}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <FaClock className="h-4 w-4" />
                                                Shift Number
                                            </p>
                                            <p className="text-gray-900 font-semibold mt-1 text-lg">
                                                {selectedRow.shift_number}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                        Status Overview
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Availability</span>
                                            <Badge variant={selectedRow.status === 1 ? "default" : "secondary"}>
                                                {selectedRow.status === 1 ? "Available" : "Unavailable"}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Login Session</span>
                                            <Badge variant={selectedRow.isLoggedIn ? "outline" : "secondary"}>
                                                {selectedRow.isLoggedIn ? "Active" : "Offline"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-8" />

                            {/* Permissions Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-5">Permissions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PermissionCard label="Delivery" enabled={selectedRow.delivery} />
                                    <PermissionCard label="Take Away" enabled={selectedRow.take_away} />
                                    <PermissionCard label="Dine In" enabled={selectedRow.dine_in} />
                                    <PermissionCard label="Online Order" enabled={selectedRow.online_order} />
                                    <PermissionCard label="Real Order" enabled={selectedRow.real_order} />
                                    <PermissionCard label="Void Order" enabled={selectedRow.void_order} />
                                    <PermissionCard label="Apply Discount" enabled={selectedRow.discount_perimission} />
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Permission Card Component
const PermissionCard = ({ label, enabled }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <span className="font-medium text-gray-700">{label}</span>
        <Badge
            variant={enabled === 1 ? "default" : "secondary"}
            className={enabled === 1 ? "bg-blue-100 text-blue-800" : ""}
        >
            {enabled === 1 ? "Enabled" : "Disabled"}
        </Badge>
    </div>
);

export default CashierMan;