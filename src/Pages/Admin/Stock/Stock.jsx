import { Switch } from "@/components/ui/switch";
import React, { useState, useEffect } from "react";
import { Table } from '@/components/ui/table';
import { Link, useNavigate } from 'react-router-dom';
import { useGet } from '@/Hooks/UseGet';
import { useDelete } from '@/Hooks/useDelete';
import { useChangeState } from '@/Hooks/useChangeState';
import DeleteDialog from '@/components/DeleteDialog';
import FullPageLoader from "@/components/Loading";
import { FaPlus } from "react-icons/fa";

const Stock = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchStockes, loading: loadingStockes, data: dataStockes } = useGet({ url: `${apiUrl}/admin/purchase_stores` });
    const { loadingDelete, deleteData } = useDelete();
    const { changeState, loadingChange } = useChangeState();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [Stockes, setStockes] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        refetchStockes();
    }, [refetchStockes]);

    useEffect(() => {
        if (dataStockes && dataStockes.stores) {
            const formatted = dataStockes?.stores?.map((u) => ({
                id: u.id,
                name: u.name || "—",
                status: u.status ? "Active" : "Inactive",
                rawStatus: u.status,
                location: u.location,
                branches: u.branches || [], // Make sure to include branches if available
            }));
            setStockes(formatted);
        }
    }, [dataStockes]);

    const handleStatusChange = async (id, newStatus) => {
        const url = `${apiUrl}/admin/purchase_stores/status/${id}?status=${newStatus ? 1 : 0}`;
        const successMessage = `${newStatus ? 'Activated' : 'Deactivated'} Successfully`;
        
        const success = await changeState(url, successMessage, {});
        
        if (success) {
            setStockes(prev => prev.map(item => 
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
        { key: "name", label: "Name" },
        { key: "location", label: "Area" },
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

    // Pass the entire item as state in navigation
    const handleEdit = (item) => navigate(`edit/${item.id}`, { state: { itemData: item } });

    const handleDelete = (item) => {
        setSelectedRow(item);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        const success = await deleteData(
            `${apiUrl}/admin/purchase_stores/delete/${selectedRow.id}`,
            `${selectedRow.name} Deleted Successfully.`,
            {}
        );

        if (success) {
            setIsDeleteOpen(false);
            setStockes((prev) => prev.filter((item) => item.id !== selectedRow.id));
            setSelectedRow(null);
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl text-bg-primary font-bold">Stock</h2>
                <Link
                    to="add"
                    className="flex justify-center items-center px-4 py-1 rounded-md text-base bg-bg-primary font-semibold text-white hover:bg-bg-primary/90"
                >
                    <FaPlus className="mr-2 h-3 w-3 text-white" /> Add
                </Link>
            </div>
            {loadingStockes ? (
                <FullPageLoader />
            ) : (
                <Table
                    data={Stockes}
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
                name={selectedRow?.name}
                isLoading={loadingDelete}
            />
        </div>
    );
};

export default Stock;