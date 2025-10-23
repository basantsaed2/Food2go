import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (

    <div className="flex w-full items-center justify-center relative overflow-hidden">
      <div className="relative z-10 text-center px-6 py-10 max-w-2xl">
        {/* 404 */}
        <div className="w-full flex items-center justify-center mb-6">
          <h1 className="text-7xl text-center font-black bg-gradient-to-br from-red-600 to-rose-400 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-3">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600">
            The page you're looking for seems to have gone missing. Let's get you back on track.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-row gap-4 justify-center">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 md:px-8 py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 hover:scale-105"
          >
            <Home size={20} />
            Home Page
          </button>
        </div>

      </div>
    </div>
  );
}