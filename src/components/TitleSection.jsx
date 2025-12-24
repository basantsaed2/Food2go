import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react";

const TitleSection = ({ text, nav = -1 }) => {
    const navigate = useNavigate()
    return (
        <>
            <div className="flex items-center mb-4">
                <button onClick={() => navigate(nav)} className="p-2.5 bg-white text-bg-primary rounded-xl mr-4 shadow-sm hover:shadow-md border border-gray-100 transition-all">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-bg-primary">{text}</h2>
            </div>

        </>
    )
}

export default TitleSection;