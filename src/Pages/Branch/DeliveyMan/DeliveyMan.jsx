import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Table } from '@/components/ui/table';
import { Link, useNavigate } from 'react-router-dom';
import { useGet } from '@/hooks/useGet';
import { useDelete } from '@/hooks/useDelete';
import { useChangeState } from '@/hooks/useChangeState';
import DeleteDialog from '@/components/DeleteDialog';
import FullPageLoader from '@/components/Loading';
import { FaPlus, FaPhone, FaWallet, FaBox, FaIdCard, FaEnvelope, FaUserShield } from 'react-icons/fa';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const DeliveryMan = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [loadingSwitches, setLoadingSwitches] = useState({});

    const { data, isLoading } = useGet({
        url: `${apiUrl}/branch/delivery`,
        queryKey: QUERY_KEYS.DELIVERY_MAN,
    });

    const { deleteData, loadingDelete } = useDelete(QUERY_KEYS.DELIVERY_MAN);
    const { changeState } = useChangeState(QUERY_KEYS.DELIVERY_MAN);

    const deliveryData = data?.deliveries?.map((item) => ({
        ...item,
        id: item.id,
        img: item.image_link,
        name: `${item.f_name} ${item.l_name}`,
        displayBalance: `${item.balance} EGP`,
        totalOrders: item.orders,
    })) || [];

    const handleStatusChange = async (id, newStatus) => {
        setLoadingSwitches(prev => ({ ...prev, [id]: true }));
        try {
            await changeState({
                url: `${apiUrl}/branch/delivery/status/${id}?status=${newStatus ? 1 : 0}`,
                successMessage: `Status updated successfully`
            });
        } finally {
            setLoadingSwitches(prev => ({ ...prev, [id]: false }));
        }
    };

    const columns = [
        { key: 'img', label: 'Image' },
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'displayBalance', label: 'Balance' },
        { key: 'totalOrders', label: 'Orders' },
        {
            key: 'status',
            label: 'Status',
            renderCell: (item) => (
                <Switch
                    checked={item.status === 1}
                    onCheckedChange={(checked) => handleStatusChange(item.id, checked)}
                    disabled={loadingSwitches[item.id]}
                    className="data-[state=checked]:bg-bg-primary"
                />
            ),
        },
    ];

    if (isLoading) return <FullPageLoader />;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-bg-primary">Delivery Management</h2>
                <Link to="add" className="flex items-center gap-2 px-5 py-2.5 bg-bg-primary text-white rounded-lg hover:opacity-90 shadow-lg transition-all font-semibold">
                    <FaPlus size={14} /> Add Delivery Man
                </Link>
            </div>

            <Table
                data={deliveryData}
                columns={columns}
                onEdit={(item) => navigate(`edit/${item.id}`, { state: { itemData: item } })}
                onDelete={(item) => { setSelectedRow(item); setIsDeleteOpen(true); }}
                onView={(item) => { setSelectedRow(item); setIsViewOpen(true); }}
            />

            <DeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onDelete={async () => {
                    await deleteData({ url: `${apiUrl}/branch/delivery/delete/${selectedRow.id}` });
                    setIsDeleteOpen(false);
                }}
                name={selectedRow?.name}
                isLoading={loadingDelete}
            />

            {/* --- ENHANCED SCROLLABLE DIALOG --- */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden rounded-2xl border-none max-h-[90vh] flex flex-col">

                    {/* Header Section (Fixed) */}
                    <div className="bg-bg-primary p-8 text-white shrink-0 relative">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl rounded-2xl">
                                <AvatarImage src={selectedRow?.image_link} className="object-cover" />
                                <AvatarFallback className="bg-white text-bg-primary text-2xl font-bold">
                                    {selectedRow?.f_name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center sm:text-left">
                                <h3 className="text-2xl font-bold">{selectedRow?.name}</h3>
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 opacity-80 text-sm">
                                    <FaEnvelope /> <span>{selectedRow?.email}</span>
                                </div>
                                <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                                    <Badge className={selectedRow?.status ? "bg-green-500 hover:bg-green-600" : "bg-red-500"}>
                                        {selectedRow?.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge variant="outline" className="text-white border-white/40">
                                        ID: {selectedRow?.id}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="p-8 space-y-8 overflow-y-auto overflow-x-hidden">

                        {/* Financial & Order Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-bg-primary"><FaWallet size={20} /></div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Balance</p>
                                    <p className="text-xl font-black text-gray-800">{selectedRow?.balance} EGP</p>
                                </div>
                            </div>
                            <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-orange-600"><FaBox size={20} /></div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Orders</p>
                                    <p className="text-xl font-black text-gray-800">{selectedRow?.orders}</p>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FaPhone className="text-[10px]" /> Contact & ID
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Phone Number</span>
                                        <span className="font-bold">{selectedRow?.phone}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">{selectedRow?.identity_type}</span>
                                        <span className="font-bold">{selectedRow?.identity_number}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FaUserShield className="text-[10px]" /> Permissions
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className={selectedRow?.chat_status ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500"}>
                                        Chat {selectedRow?.chat_status ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                    <Badge className={selectedRow?.phone_status ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500"}>
                                        Phone Verified
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Document Image */}
                        {selectedRow?.identity_image_link && (
                            <div className="pt-4 pb-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 text-center sm:text-left">Identity Document</h4>
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <img
                                        src={selectedRow.identity_image_link}
                                        className="w-full h-auto max-h-[300px] object-contain rounded-xl"
                                        alt="ID Document"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DeliveryMan;