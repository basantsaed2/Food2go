import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ChevronLeft } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import { useSelector } from 'react-redux';

// Helper for default state to avoid redundancy
const getInitialState = (isEditMode, itemData) => {
    const base = {
        name: '', password: '', shift_number: '', my_id: '',
        image: null, img: '', delivery: false, take_away: false,
        dine_in: false, online_order: false, discount_perimission: false,
        real_order: false, void_order: false, status: true
    };

    if (isEditMode && itemData) {
        return {
            ...base,
            name: itemData.name || '',
            shift_number: itemData.shift_number || '',
            my_id: itemData.my_id || '',
            image: itemData.image_link || null,
            img: itemData.image_link || '',
            // Mapping numeric 1/0 from API to boolean
            ...['delivery', 'take_away', 'dine_in', 'online_order', 'discount_perimission', 'real_order', 'void_order', 'status']
                .reduce((acc, key) => ({ ...acc, [key]: !!itemData[key] }), {})
        };
    }
    return base;
};

const AddCashierMan = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { cashierManId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useSelector(state => state.auth);

    const isEditMode = !!cashierManId;
    const itemData = state?.itemData;
    const [values, setValues] = useState({});

    const { postData: addCashierMan, loadingPost: adding } = usePost({
        url: `${apiUrl}/branch/cashier_man/add`,
        invalidateKey: 'CASHIER_MAN',
    });

    const { postData: updateCashierMan, loadingPost: updating } = usePost({
        url: `${apiUrl}/branch/cashier_man/update/${cashierManId}`,
        invalidateKey: 'CASHIER_MAN',
    });

    useEffect(() => {
        setValues(getInitialState(isEditMode, itemData));
    }, [isEditMode, itemData]);

    const fields = useMemo(() => [
        { name: 'name', type: 'input', placeholder: 'User Name', required: true },
        { name: 'password', type: 'input', placeholder: 'Password', inputType: 'password', required: !isEditMode },
        { name: 'shift_number', type: 'input', placeholder: 'Shift Number', inputType: 'number', required: true },
        { name: 'my_id', type: 'input', placeholder: 'My ID', inputType: 'number', required: true },
        { name: 'image', type: 'file', placeholder: 'Profile Image' },
        { type: 'switch', name: 'delivery', placeholder: 'Delivery Permission' },
        { type: 'switch', name: 'take_away', placeholder: 'Take Away Permission' },
        { type: 'switch', name: 'dine_in', placeholder: 'Dine In Permission' },
        { type: 'switch', name: 'online_order', placeholder: 'Online Order Permission' },
        { type: 'switch', name: 'discount_perimission', placeholder: 'Discount Permission' },
        { type: 'switch', name: 'real_order', placeholder: 'Real Order Permission' },
        { type: 'switch', name: 'void_order', placeholder: 'Void Order Permission' },
        { type: 'switch', name: 'status', placeholder: 'Account Status' },
    ], [isEditMode]);

    const handleChange = (_, name, value) => setValues(prev => ({ ...prev, [name]: value }));

    const handleSubmit = () => {
        const formData = new FormData();
        const booleanFields = ['delivery', 'take_away', 'dine_in', 'online_order', 'discount_perimission', 'real_order', 'void_order', 'status'];

        formData.append('user_name', values.name || '');
        formData.append('branch_id', user?.id || '');
        formData.append('shift_number', values.shift_number || '');
        formData.append('my_id', values.my_id || '');
        if (values.password) formData.append('password', values.password);

        // Append booleans as 1/0
        booleanFields.forEach(field => formData.append(field, values[field] ? 1 : 0));

        if (values.image && typeof values.image !== 'string') {
            formData.append('image', values.image);
        }

        const msg = isEditMode ? 'Updated Successfully!' : 'Added Successfully!';
        const submitFn = isEditMode ? updateCashierMan : addCashierMan;
        submitFn(formData, msg, () => navigate(-1));
    };

    if (isEditMode && !itemData) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-md mr-3 shadow-sm">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold">{isEditMode ? 'Edit' : 'Add'} Cashier Man</h2>
            </div>

            <div className="py-10 px-4 bg-white rounded-lg shadow-md">
                <Add fields={fields} values={values} onChange={handleChange} />
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <button onClick={() => setValues(getInitialState(isEditMode, itemData))} className="px-6 py-2 bg-gray-300 rounded-md">Reset</button>
                <button
                    onClick={handleSubmit}
                    disabled={adding || updating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                >
                    {adding || updating ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
                </button>
            </div>
        </div>
    );
};

export default AddCashierMan;