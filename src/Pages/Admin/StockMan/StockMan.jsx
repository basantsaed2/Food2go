import React, { useState, useEffect } from "react";
import { Table } from '@/components/ui/table';
import { Link, useNavigate } from 'react-router-dom';
import { useGet } from '@/Hooks/UseGet';
import { useDelete } from '@/Hooks/useDelete';
import { useChangeState } from '@/Hooks/useChangeState';
import DeleteDialog from '@/components/DeleteDialog';
import FullPageLoader from "@/components/Loading";
import { FaPlus } from "react-icons/fa";
import { Switch } from "@/components/ui/switch";

const StockMan = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchStockMen, loading: loadingStockMen, data: dataStockMen } = useGet({ url: `${apiUrl}/admin/purchase_store_man` });
    const { loadingDelete, deleteData } = useDelete();
    const { changeState, loadingChange } = useChangeState();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [StockMen, setStockMen] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        refetchStockMen();
    }, [refetchStockMen]);

    useEffect(() => {
        if (dataStockMen && dataStockMen.store_men) {
            const formatted = dataStockMen.store_men.map((u) => ({
                id: u.id,
                user_name: u.user_name || "—",
                phone: u.phone || "—",
                store_name: u.store?.name || "—",
                status: u.status ? "Active" : "Inactive",
                rawStatus: u.status,
                image: u.image || null,
            }));
            setStockMen(formatted);
        }
    }, [dataStockMen]);

    const handleStatusChange = async (id, newStatus) => {
        const url = `${apiUrl}/admin/purchase_store_man/status/${id}?status=${newStatus ? 1 : 0}`;
        const successMessage = `${newStatus ? 'Activated' : 'Deactivated'} Successfully`;
        
        const success = await changeState(url, successMessage, {});
        
        if (success) {
            setStockMen(prev => prev.map(item => 
                item.id === id 
                    ? { 
                        ...item, 
                        status: newStatus ? "Active" : "Inactive",
                        rawStatus: newStatus 
                    } 
                    : item
            ));
        }
    };

    const Columns = [
        { 
            key: "image", 
            label: "Image",
            renderCell: (item) => (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                        <img 
                            src={item.image} 
                            alt={item.user_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-gray-500 text-sm">
                            {item.user_name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                    )}
                </div>
            )
        },
        { key: "user_name", label: "User Name" },
        { key: "phone", label: "Phone" },
        { key: "store_name", label: "Store" },
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

    const handleEdit = (item) => navigate(`edit/${item.id}`, { state: { itemData: item } });

    const handleDelete = (item) => {
        setSelectedRow(item);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        const success = await deleteData(
            `${apiUrl}/admin/purchase_store_man/delete/${selectedRow.id}`,
            `${selectedRow.user_name} Deleted Successfully.`,
            {}
        );

        if (success) {
            setIsDeleteOpen(false);
            setStockMen((prev) => prev.filter((item) => item.id !== selectedRow.id));
            setSelectedRow(null);
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl text-bg-primary font-bold">Stock Men</h2>
                <Link
                    to="add"
                    className="flex justify-center items-center px-4 py-1 rounded-md text-base bg-bg-primary font-semibold text-white hover:bg-bg-primary/90"
                >
                    <FaPlus className="mr-2 h-3 w-3 text-white" /> Add
                </Link>
            </div>
            {loadingStockMen ? (
                <FullPageLoader />
            ) : (
                <Table
                    data={StockMen}
                    columns={Columns}
                    statusKey="status"
                    onEdit={(item) => handleEdit(item)}
                    onDelete={handleDelete}
                    className="w-full rounded-lg shadow-md p-6"
                />
            )}
            <DeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onDelete={handleDeleteConfirm}
                name={selectedRow?.user_name}
                isLoading={loadingDelete}
            />
        </div>
    );
};

export default StockMan;