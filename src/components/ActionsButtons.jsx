
const ActionsButtons = ({ resetForm, handleSubmit, loadingPost, isEditMode }) => {
    return (
        <div className="mt-8 flex items-center justify-end gap-4">
            <button type="button" onClick={() => resetForm()} className="px-6 py-2 cursor-pointer text-gray-500 font-medium hover:text-gray-700">Reset</button>
            <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loadingPost}
                className="px-12 py-3 bg-bg-primary text-white rounded-xl cursor-pointer shadow-lg shadow-bg-primary/20 hover:opacity-90 font-bold transition-all disabled:opacity-50"
            >
                {loadingPost ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
            </button>
        </div>
    )
}

export default ActionsButtons;
