'use client';

interface Booking {
  id: number;
  bookingRef: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  seatNumber: string;
  travelDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  specialRequests: string | null;
  busInfo?: {
    operatorName: string;
    departureTime: string;
    arrivalTime: string;
    fromCity: string;
    toCity: string;
  };
}

interface BookingsListProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
};

export default function BookingsList({ bookings, onEdit, onDelete }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Booking Ref
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Passenger
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Route & Bus
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Seat
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Travel Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Amount (ZMW)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {bookings.map((booking: any) => (
              <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {booking.bookingRef}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-medium">{booking.passengerName}</div>
                  <div className="text-xs text-slate-500">{booking.passengerPhone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {booking.busInfo ? (
                    <div>
                      <div className="font-medium">{booking.busInfo.fromCity} → {booking.busInfo.toCity}</div>
                      <div className="text-xs text-slate-500">{booking.busInfo.operatorName}</div>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                  {booking.seatNumber}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(booking.travelDate).toLocaleDateString('en-ZM', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  ZMW {Number(booking.totalAmount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[booking.status as keyof typeof statusColors]
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right space-x-2">
                  <a
                    href={`/dashboard/bookings/${booking.id}`}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    View
                  </a>
                  <button
                    onClick={() => onEdit(booking)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(booking.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
