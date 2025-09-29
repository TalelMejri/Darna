import { useState } from 'react';
import { Search, Filter, Calendar, MapPin, DollarSign, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

const AnnoncesManagement = () => {
  const [reservations, setReservations] = useState([
    { 
      id: 1, 
      property: 'Modern Apartment Downtown', 
      guest: 'John Doe', 
      owner: 'Jane Smith',
      checkIn: '2024-02-01', 
      checkOut: '2024-02-07', 
      total: 840, 
      status: 'confirmed',
      createdAt: '2024-01-15'
    },
    { 
      id: 2, 
      property: 'Cozy Studio Near Campus', 
      guest: 'Mike Johnson', 
      owner: 'Sarah Wilson',
      checkIn: '2024-02-10', 
      checkOut: '2024-02-15', 
      total: 400, 
      status: 'pending',
      createdAt: '2024-01-14'
    },
    { 
      id: 3, 
      property: 'Luxury Villa Beachfront', 
      guest: 'Emily Brown', 
      owner: 'Robert Davis',
      checkIn: '2024-03-01', 
      checkOut: '2024-03-10', 
      total: 2250, 
      status: 'cancelled',
      createdAt: '2024-01-13'
    },
  ]);

  const deleteReservation = (reservationId: number) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      setReservations(reservations.filter(res => res.id !== reservationId));
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations Management</h1>
          <p className="text-gray-600 mt-1">Manage all property reservations</p>
        </div>
        
        <div className="flex gap-3">
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Property & Guest</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Dates</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Total</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{reservation.property}</p>
                    <p className="text-sm text-gray-600">Guest: {reservation.guest}</p>
                    <p className="text-sm text-gray-600">Owner: {reservation.owner}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{reservation.checkIn} to {reservation.checkOut}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-1 text-green-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{reservation.total}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reservation.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800 p-1 rounded transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteReservation(reservation.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{reservation.property}</h3>
                <p className="text-sm text-gray-600 mb-1">Guest: {reservation.guest}</p>
                <p className="text-sm text-gray-600 mb-2">Owner: {reservation.owner}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{reservation.checkIn} to {reservation.checkOut}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1 text-green-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{reservation.total}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reservation.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-gray-500">Created: {reservation.createdAt}</span>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-800 p-1 rounded transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteReservation(reservation.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnoncesManagement;