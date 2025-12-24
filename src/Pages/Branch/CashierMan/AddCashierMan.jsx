import { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Formik } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { ChevronLeft } from 'lucide-react';
import Add from '@/components/AddFieldSection';
import { usePost } from '@/hooks/usePost';

// 1. PAGE-SPECIFIC VALIDATION (Internal to this page)
const cashierSchema = z.object({
    name: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be 6+ chars").optional().or(z.literal('')),
    shift_number: z.coerce.number().min(1, "Shift number is required"),
    my_id: z.coerce.number().min(1, "ID is required"),
    image: z.any().nullable(),
    delivery: z.boolean(),
    take_away: z.boolean(),
    dine_in: z.boolean(),
    online_order: z.boolean(),
    discount_perimission: z.boolean(),
    real_order: z.boolean(),
    void_order: z.boolean(),
    status: z.boolean(),
});

const AddCashierMan = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { cashierManId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useSelector(state => state.auth);

    const isEditMode = !!cashierManId;
    const itemData = state?.itemData;

    const { postData, loadingPost } = usePost({
        url: isEditMode ? `${apiUrl}/branch/cashier_man/update/${cashierManId}` : `${apiUrl}/branch/cashier_man/add`,
        invalidateKey: 'CASHIER_MAN',
    });

    // 2. Initial State Logic
    const initialValues = useMemo(() => {
        const base = {
            name: '', password: '', shift_number: '', my_id: '',
            image: null, delivery: false, take_away: false,
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
                ...['delivery', 'take_away', 'dine_in', 'online_order', 'discount_perimission', 'real_order', 'void_order', 'status']
                    .reduce((acc, key) => ({ ...acc, [key]: !!itemData[key] }), {})
            };
        }
        return base;
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

    const handleSubmit = (values) => {
        const formData = new FormData();
        formData.append('user_name', values.name);
        formData.append('branch_id', user?.id || '');
        formData.append('shift_number', values.shift_number);
        formData.append('my_id', values.my_id);
        if (values.password) formData.append('password', values.password);

        // Boolean to 1/0
        ['delivery', 'take_away', 'dine_in', 'online_order', 'discount_perimission', 'real_order', 'void_order', 'status']
            .forEach(f => formData.append(f, values[f] ? 1 : 0));

        if (values.image && typeof values.image !== 'string') {
            formData.append('image', values.image);
        }

        postData(formData, isEditMode ? 'Updated Successfully!' : 'Added Successfully!', () => navigate(-1));
    };

    if (isEditMode && !itemData) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-md mr-3 shadow-sm hover:bg-gray-100">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold">{isEditMode ? 'Edit' : 'Add'} Cashier Man</h2>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={toFormikValidationSchema(cashierSchema)}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, setFieldValue, handleSubmit, resetForm }) => (
                    <>
                        <div className="py-10 px-4 bg-white rounded-lg shadow-md transition-all">
                            <Add
                                fields={fields}
                                values={values}
                                errors={errors}
                                touched={touched}
                                onChange={(_, name, val) => setFieldValue(name, val)}
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => resetForm()}
                                className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit()}
                                disabled={loadingPost}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700 shadow-lg"
                            >
                                {loadingPost ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
                            </button>
                        </div>
                    </>
                )}
            </Formik>
        </div>
    );
};

export default AddCashierMan;