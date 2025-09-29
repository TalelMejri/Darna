import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Mail } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br pt-8 from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="relative mb-8">
          <div className="text-5xl font-bold text-gray-900 opacity-10 absolute inset-0 transform -translate-y-4">
            404
          </div>
          <div className="relative">
            <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-600 bg-clip-text text-transparent">
              4
            </span>
            <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-600 bg-clip-text text-transparent">
              0
            </span>
            <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-600 bg-clip-text text-transparent">
              4
            </span>
          </div>
        </div>
        <div className="relative mb-12">
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-200 rounded-full opacity-30 animate-pulse delay-75"></div>
          <div className="absolute top-4 -right-8 w-8 h-8 bg-emerald-200 rounded-full opacity-40 animate-pulse delay-150"></div>
          <div className="relative z-10">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="w-24 h-24 border-4 border-gray-300 rounded-full mx-auto"></div>
              <div className="w-8 h-12 bg-gray-300 transform rotate-45 absolute bottom-4 right-6 rounded-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <div className="absolute bottom-6 w-12 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Oops! It looks like the page you're looking for has been moved, 
              deleted, or doesn't exist.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Back to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;