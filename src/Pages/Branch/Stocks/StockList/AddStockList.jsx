// src/pages/AddStock.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Add from '@/components/AddFieldSection';
import { ChevronLeft } from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { usePost } from '@/hooks/usePost';
import FullPageLoader from '@/components/Loading';
import { QUERY_KEYS } from '@/constants/queryKeys';

const AddStock = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { stockId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const isEditMode = !!stockId;
  const title = isEditMode ? 'Edit Stock' : 'Add Stock';
  const itemData = state?.itemData;

  // FETCH BRANCHES
  const {
    data: branchData,
    isLoading: loadingBranches,
  } = useGet({
    url: `${apiUrl}/branch/purchase_stores`,
    queryKey: QUERY_KEYS.BRI,
  });

  const branches = branchData?.branches?.map((b) => ({
    value: b.id,
    label: b.name,
  })) || [];

  // MUTATIONS
  const addUrl = `${apiUrl}/branch/purchase_stores/add`;
  const updateUrl = `${apiUrl}/branch/purchase_stores/update/${stockId}`;

  const { postData: addStock, loadingPost: adding } = usePost(addUrl, QUERY_KEYS.STOCKS);
  const { postData: updateStock, loadingPost: updating } = usePost(updateUrl, QUERY_KEYS.STOCKS);

  // FORM STATE
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({}); // ← NEW: field errors

  useEffect(() => {
    if (isEditMode && itemData) {
      const branchIds = itemData.branches?.map((b) => b.id) || [];
      setValues({
        name: itemData.name || '',
        location: itemData.location || '',
        status: itemData.rawStatus ? 'Active' : 'Inactive',
        branches: branchIds,
      });
    } else {
      setValues({ name: '', location: '', status: 'Active', branches: [] });
    }
    setErrors({}); // Clear errors on mount
  }, [isEditMode, itemData]);

  // FORM FIELDS
  const fields = [
    { name: 'name', type: 'input', placeholder: 'Stock Name' },
    { name: 'location', type: 'input', placeholder: 'Area' },
    {
      name: 'branches',
      type: 'multi-select',
      placeholder: 'Branches',
      options: branches,
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
    setErrors((prev) => ({ ...prev, [name]: null })); // Clear error on change
  };

  const handleSubmit = () => {
    const payload = {
      name: values.name || '',
      location: values.location || '',
      branches: values.branches || [],
      status: values.status === 'Active' ? 1 : 0,
    };

    const successMessage = isEditMode
      ? 'Stock Updated Successfully!'
      : 'Stock Added Successfully!';

    const onSuccess = () => {
      navigate(-1);
    };
    if (isEditMode) {
      updateStock(payload, successMessage, onSuccess);
    } else {
      addStock(payload, successMessage, onSuccess);
    }
  };

  const handleReset = () => {
    if (isEditMode && itemData) {
      const ids = itemData.branches?.map((b) => b.id) || [];
      setValues({
        name: itemData.name || '',
        location: itemData.location || '',
        status: itemData.status ? 'Active' : 'Inactive',
        branches: ids,
      });
    } else {
      setValues({ name: '', location: '', status: 'Active', branches: [] });
    }
    setErrors({});
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
        {loadingBranches ? (
          <FullPageLoader />
        ) : (
          <Add
            fields={fields}
            values={values}
            onChange={handleChange}
            errors={errors} // ← PASS ERRORS
          />
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

export default AddStock;