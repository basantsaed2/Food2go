// src/pages/AddCashier.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ChevronLeft } from 'lucide-react';
import { usePost } from '@/Hooks/usePost';
import FullPageLoader from '@/components/Loading';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useSelector } from 'react-redux';
import { useMultiLanguageNames } from '@/Hooks/useMultiLanguageNames';

const AddCashier = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { cashierId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();

    const isEditMode = !!cashierId;
    const title = isEditMode ? 'Edit Cashier' : 'Add Cashier';
    const itemData = state?.itemData;

    const { user } = useSelector(state => state.auth);
    // Assuming user ID holds the branch ID when logged in as a branch user
    const loggedInBranchId = user?.id;

    // =======================================================
    // 1. FETCH REQUIRED DATA (USING GENERAL HOOK)
    // =======================================================

    const { initialNameStructure, loadingTranslation } = useMultiLanguageNames();


    // =======================================================
    // 2. MUTATION HOOKS (ADD & UPDATE)
    // =======================================================

    const { postData: addCashier, loadingPost: adding } = usePost({
        url: `${apiUrl}/branch/cashier/add`,
        invalidateKey: QUERY_KEYS.CASHIERS,
    });
    const { postData: updateCashier, loadingPost: updating } = usePost({
        url: `${apiUrl}/branch/cashier/update/${cashierId}`,
        invalidateKey: QUERY_KEYS.CASHIERS,
    });

    // =======================================================
    // 3. STATE MANAGEMENT
    // =======================================================

    const [active, setActive] = useState(true);
    const [cashierNames, setCashierNames] = useState([]);
    const [errors, setErrors] = useState({});

    // Effect to set cashierNames once initialNameStructure is computed
    useEffect(() => {
        if (initialNameStructure.length > 0) {

            if (isEditMode && itemData) {
                setActive(itemData.status === 1);

                const updatedNames = initialNameStructure.map(initial => {
                    const existingName = itemData.cashier_names?.find(cn => cn.translation_id === initial.translation_id);
                    return {
                        ...initial,
                        name: existingName?.name || '',
                    };
                });
                setCashierNames(updatedNames);
            } else {
                setActive(true);
                setCashierNames(initialNameStructure);
            }
        }
        setErrors({});
    }, [isEditMode, itemData, initialNameStructure]);


    // =======================================================
    // 4. FORM FIELDS CONFIGURATION
    // =======================================================

    const fields = [
        // Cashier Names (Multi-language text fields)
        ...cashierNames.map((nameItem) => ({
            name: `name_${nameItem.translation_id}`,
            type: 'input',
            label: `Cashier Name (${nameItem.translation_name})`,
            placeholder: `Enter name in ${nameItem.translation_name}`,
            required: nameItem.translation_name.toLowerCase() === 'english',
            // IMPORTANT: This passes the current value to Add.jsx
            value: nameItem.name,
            // IMPORTANT: This handles the state update when the input changes
            onChange: (value) => {
                setCashierNames(prev => prev.map(item =>
                    item.translation_id === nameItem.translation_id
                        ? { ...item, name: value }
                        : item
                ));
                setErrors(prev => ({ ...prev, [`name_${nameItem.translation_id}`]: null }));
            },
            error: errors[`name_${nameItem.translation_id}`],
        })),
        // Status Switch
        {
            type: 'switch',
            name: 'status',
            label: 'Status',
            activeLabel: 'Active',
            inactiveLabel: 'Inactive',
            value: active,
            onChange: (value) => setActive(value),
            error: errors.status,
        },
    ];


    // =======================================================
    // 5. HANDLERS (Validation & Submission)
    // =======================================================

    const handleSubmit = () => {
        const newErrors = {};

        if (!loggedInBranchId) {
            newErrors.general = 'Cannot determine the Branch ID for submission. Please refresh or log in again.';
            setErrors(newErrors);
            return;
        }

        const englishName = cashierNames.find(item => item.translation_name.toLowerCase() === 'english');
        if (englishName && !englishName.name.trim()) {
            newErrors[`name_${englishName.translation_id}`] = 'Cashier name (English) is required.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formData = new FormData();

        formData.append("branch_id", loggedInBranchId);
        formData.append("status", active ? 1 : 0);

        cashierNames.forEach((nameItem, index) => {
            if (nameItem.name.trim()) {
                // 🚨 FIX FOR API TYPO: Using the misspelled keys 'tranlation_id' and 'tranlation_name' 
                // to match the server's validation error message.
                formData.append(`cashier_names[${index}][tranlation_id]`, nameItem.translation_id);
                formData.append(`cashier_names[${index}][tranlation_name]`, nameItem.translation_name);
                // The 'name' field is fine
                formData.append(`cashier_names[${index}][name]`, nameItem.name.trim());
            }
        });

        const successMessage = isEditMode
            ? 'Cashier Updated Successfully!'
            : 'Cashier Added Successfully!';

        const onSuccess = () => {
            navigate(-1);
        };

        const onError = (error) => {
            console.error("Submission Error:", error);
            // Optional: You can add logic here to map complex API errors back to setErrors
        }

        const action = isEditMode ? updateCashier : addCashier;

        action(formData, {
            onSuccess,
            onError,
            successMessage
        });
    };

    const handleReset = () => {
        setActive(true);
        setCashierNames(initialNameStructure);
        setErrors({});
    };

    const handleBack = () => navigate(-1);

    // =======================================================
    // 6. RENDER LOGIC
    // =======================================================

    if (loadingTranslation && cashierNames.length === 0) {
        return <FullPageLoader />;
    }

    if (!loggedInBranchId) {
        return (
            <div className="p-4">
                <p className="text-red-600 font-bold">Error: Branch context not found. Please ensure you are logged in as a branch user.</p>
            </div>
        );
    }

    if (isEditMode && !itemData) {
        return (
            <div className="p-4">
                <div className="flex items-center mb-4">
                    <button onClick={handleBack} className="p-2 bg-white text-bg-primary rounded-md mr-3">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-bg-primary">{title}</h2>
                </div>
                <p className="text-center py-8">Cashier data not found. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <button onClick={handleBack} className="p-2 bg-white text-bg-primary rounded-md mr-3">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-bg-primary">{title}</h2>
            </div>

            <div className="py-10 px-4 bg-white rounded-lg shadow-md">
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                        {errors.general}
                    </div>
                )}
                <Add
                    fields={fields}
                    values={{}}
                    onChange={() => { }}
                    errors={errors}
                />
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={adding || updating}
                    className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                >
                    Reset
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={adding || updating}
                    className="px-4 py-2 bg-bg-primary text-white rounded-md hover:bg-bg-primary/90"
                >
                    {(adding || updating) ? 'Submitting…' : isEditMode ? 'Update Cashier' : 'Add Cashier'}
                </button>
            </div>
        </div>
    );
};

export default AddCashier;