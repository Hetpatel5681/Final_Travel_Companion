import React from 'react';
import { IActivity } from '../types/itinerary.types';
import { getCategoryIcon } from '../utils/categoryIcons.utils';
import { formatCurrency } from '../../../utils/currency.utils';

interface ActivityDetailsModalProps {
  activity: IActivity;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({ 
  activity, isOpen, onClose, onStatusChange 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ✕
          </button>
          
          <div className="p-8">
            <div className="flex gap-4 items-start mb-6">
               <div className="text-4xl">{getCategoryIcon(activity.category)}</div>
               <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold px-2 py-1 bg-black text-white rounded uppercase">{activity.category}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                      activity.priority === 'Must-Do' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.priority}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{activity.title}</h2>
               </div>
            </div>

            <p className="text-slate-600 leading-relaxed mb-8">{activity.description || 'No description provided.'}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                 <h4 className="font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Timing & Location</h4>
                 <div className="space-y-3 text-sm">
                   <div className="flex justify-between">
                     <span className="text-slate-500">Duration</span>
                     <span className="font-medium text-slate-700">{activity.estimatedDuration ? `${activity.estimatedDuration} mins` : 'N/A'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-slate-500">Start Time</span>
                     <span className="font-medium text-slate-700">{activity.startTime ? new Date(activity.startTime).toLocaleTimeString() : 'Anytime'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-slate-500">End Time</span>
                     <span className="font-medium text-slate-700">{activity.endTime ? new Date(activity.endTime).toLocaleTimeString() : 'N/A'}</span>
                   </div>
                   {activity.location?.address && (
                     <div className="pt-2 border-t border-slate-200 mt-2">
                       <span className="text-slate-500 block mb-1">Address</span>
                       <span className="font-medium text-slate-700 block">{activity.location.address}</span>
                       {activity.googleMapsUrl && (
                         <a href={activity.googleMapsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline mt-1 block">View on Maps ↗</a>
                       )}
                     </div>
                   )}
                 </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                 <h4 className="font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Estimated Costs</h4>
                 <div className="space-y-3 text-sm">
                   <div className="flex justify-between">
                     <span className="text-slate-500">Tickets</span>
                     <span className="font-medium text-slate-700">{activity.ticketPrice ? formatCurrency(activity.ticketPrice, activity.currency) : '-'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-slate-500">Transport</span>
                     <span className="font-medium text-slate-700">{activity.estimatedExpense?.transport ? formatCurrency(activity.estimatedExpense.transport, activity.currency) : '-'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-slate-500">Food</span>
                     <span className="font-medium text-slate-700">{activity.estimatedExpense?.food ? formatCurrency(activity.estimatedExpense.food, activity.currency) : '-'}</span>
                   </div>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                 <h4 className="font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Booking Info</h4>
                 {activity.bookingRequired ? (
                   <div className="space-y-2 text-sm">
                     <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded inline-block font-medium mb-2">Booking Required</span>
                     {activity.reservationNumber && <p className="text-slate-700 font-medium">Reservation: {activity.reservationNumber}</p>}
                     {activity.bookingUrl && <a href={activity.bookingUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Booking Link ↗</a>}
                   </div>
                 ) : (
                   <span className="text-slate-500 text-sm">No booking required</span>
                 )}
               </div>

               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                 <h4 className="font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Notes</h4>
                 <p className="text-slate-600 text-sm italic">{activity.notes || 'No extra notes.'}</p>
               </div>
            </div>

            <div className="bg-slate-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
               <div>
                 <h4 className="font-bold text-slate-800">Status Tracking</h4>
                 <p className="text-xs text-slate-500 mt-1">Currently marked as <span className="font-bold uppercase text-slate-700">{activity.status}</span></p>
               </div>
               
               <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                 {['Pending', 'Completed', 'Cancelled', 'Skipped'].map(s => (
                   <button 
                     key={s}
                     onClick={() => onStatusChange(s)}
                     className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                       activity.status === s ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
                     }`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
            </div>

          </div>
       </div>
    </div>
  );
};
