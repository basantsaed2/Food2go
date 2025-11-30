// src/pages/AddStockMan.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ChevronLeft } from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { usePost } from '@/hooks/usePost';
import FullPageLoader from '@/components/Loading';
import { QUERY_KEYS } from '@/constants/queryKeys';

const AddStockMan = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { stockManId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const isEditMode = !!stockManId;
  const title = isEditMode ? 'Edit Stock Man' : 'Add Stock Man';
  const itemData = state?.itemData;

  // FETCH STORES
  const {
    data: storeData,
    isLoading: loadingStores,
  } = useGet({
    url: `${apiUrl}/branch/purchase_stores`,
    queryKey: QUERY_KEYS.STOCKS, // نستخدم نفس المفتاح
  });

  const stores = storeData?.stores?.map((s) => ({
    value: s.id.toString(),
    label: s.name,
  })) || [];

  // MUTATIONS
  const addUrl = `${apiUrl}/branch/purchase_store_man/add`;
  const updateUrl = `${apiUrl}/branch/purchase_store_man/update/${stockManId}`;

  const { postData: addStockMan, loadingPost: adding } = usePost(addUrl, QUERY_KEYS.STOCKMAN, 'multipart');
  const { postData: updateStockMan, loadingPost: updating } = usePost(updateUrl, QUERY_KEYS.STOCKMAN, 'multipart');

  // FORM STATE
  const [values, setValues] = useState({});

  useEffect(() => {
    if (isEditMode && itemData) {
      setValues({
        user_name: itemData.user_name || '',
        phone: itemData.phone || '',
        password: '', // لا نملأ كلمة المرور
        store_id: itemData.store?.id?.toString() || '',
        status: itemData.rawStatus ? 'Active' : 'Inactive',
        image: itemData.image || null,
      });
    } else {
      setValues({
        user_name: '',
        phone: '',
        password: '',
        store_id: '',
        status: 'Active',
        image: null,
      });
    }
  }, [isEditMode, itemData]);

  // FORM FIELDS
  const fields = [
    { name: 'user_name', type: 'input', placeholder: 'User Name', required: true },
    { name: 'phone', type: 'input', placeholder: 'Phone Number', inputType: 'tel' },
    {
      name: 'password',
      type: 'input',
      placeholder: 'Password',
      inputType: 'password',
      required: !isEditMode,
    },
    {
      name: 'store_id',
      type: 'select',
      placeholder: 'Select Store',
      options: stores,
    },
    {
      name: 'image',
      type: 'file',
      placeholder: 'Profile Image',
      accept: 'image/*',
    },
    {
      type: 'switch',
      name: 'status',
      placeholder: 'Status',
      returnType: 'string',
      activeLabel: 'Active',
      inactiveLabel: 'Inactive',
    },
  ];

  const handleChange = (_lang, name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('user_name', values.user_name || '');
    formData.append('phone', values.phone || '');
    if (values.password) formData.append('password', values.password);
    formData.append('store_id', values.store_id || ''); // ملاحظة: في الكود القديم كان stora_id → خطأ
    formData.append('status', values.status === 'Active' ? 1 : 0);
    if (values.image && typeof values.image !== 'string') {
      formData.append('image', values.image);
    }

    const successMessage = isEditMode
      ? 'Stock Man Updated Successfully!'
      : 'Stock Man Added Successfully!';

    const onSuccess = () => {
      navigate(-1); // رجوع تلقائي
    };

    if (isEditMode) {
      updateStockMan(formData, successMessage, onSuccess);
    } else {
      addStockMan(formData, successMessage, onSuccess);
    }
  };

  const handleReset = () => {
    if (isEditMode && itemData) {
      setValues({
        user_name: itemData.user_name || '',
        phone: itemData.phone || '',
        password: '',
        store_id: itemData.store?.id?.toString() || '',
        status: itemData.rawStatus ? 'Active' : 'Inactive',
        image: itemData.image || null,
      });
    } else {
      setValues({
        user_name: '',
        phone: '',
        password: '',
        store_id: '',
        status: 'Active',
        image: null,
      });
    }
  };

  const handleBack = () => navigate(-1);

  // LOADING IN EDIT MODE WITHOUT DATA
  if (isEditMode && !itemData) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <button onClick={handleBack} className="p-2 bg-white text-bg-primary rounded-md mr-3">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-bg-primary">{title}</h2>
        </div>
        <p className="text-center py-8">Loading…</p>
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
        {loadingStores ? (
          <FullPageLoader />
        ) : (
          <Add fields={fields} values={values} onChange={handleChange} />
        )}
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
          {adding || updating ? 'Submitting…' : isEditMode ? 'Update' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default AddStockMan;