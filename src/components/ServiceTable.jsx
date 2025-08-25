import React from 'react';
import { Edit, Trash2, Clock, Info, MoreHorizontal } from 'lucide-react'; // Menambahkan ikon MoreHorizontal

// Fungsi getStatusHighlightStyle tidak berubah
const getStatusHighlightStyle = (status) => {
  const styles = {
    'Masuk': 'bg-blue-50 hover:bg-blue-100',
    'Pengecekan': 'bg-yellow-50 hover:bg-yellow-100',
    'Dikerjakan': 'bg-orange-50 hover:bg-orange-100',
    'Selesai': 'bg-green-50 hover:bg-green-100',
    'Diambil': 'bg-teal-50 hover:bg-teal-100',
    'Batal': 'bg-red-50 hover:bg-red-100',
  };
  return styles[status] || 'bg-white hover:bg-gray-50';
};

const statusOrder = { 'Masuk': 1, 'Pengecekan': 2, 'Dikerjakan': 3, 'Selesai': 4, 'Diambil': 5, 'Batal': 5 };

function ServiceTable({ services, onEdit, onDelete, onStatusChange }) {
  if (!services || services.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center h-full bg-white rounded-lg shadow-sm border">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Tidak Ada Data Servis</p>
          <p className="text-sm">Silakan ubah filter atau tambahkan data servis baru.</p>
        </div>
      </div>
    );
  }

  // Logika handleStatusChange dan formatDeadline tidak berubah
  const handleStatusChange = (service, newStatus) => {
    const currentStatusOrder = statusOrder[service.status];
    const newStatusOrder = statusOrder[newStatus];
    if (service.status === newStatus) return;
    if (newStatusOrder < currentStatusOrder) {
      alert(`Tidak bisa mengubah status dari "${service.status}" ke "${newStatus}". Progres tidak bisa mundur.`);
      const selectElement = document.querySelector(`select[data-id='${service.id}']`);
      if (selectElement) selectElement.value = service.status;
      return;
    }
    if (window.confirm(`Anda yakin ingin mengubah status dari "${service.status}" menjadi "${newStatus}"?`)) {
      onStatusChange(service.id, newStatus);
    } else {
      const selectElement = document.querySelector(`select[data-id='${service.id}']`);
      if (selectElement) selectElement.value = service.status;
    }
  };
  
  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let colorClass = 'text-gray-500';
    if (diffDays < 0) {
      colorClass = 'text-red-500 font-bold';
    } else if (diffDays <= 3) {
      colorClass = 'text-orange-500 font-semibold';
    }

    return (
      <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
        <Clock size={12} />
        {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-x-auto bg-white rounded-lg shadow-sm border">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-[5%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
            <th scope="col" className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
            <th scope="col" className="w-[35%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barang & Kerusakan</th>
            <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="w-[10%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
         {services.map((service) => {
            const hasMultipleItems = Array.isArray(service.item_name) && service.item_name.length > 1;
            const firstItemName = Array.isArray(service.item_name) ? service.item_name[0] : service.item_name;
            const firstItemDamage = Array.isArray(service.item_damage) ? service.item_damage[0] : service.item_damage;
            const remainingItemsCount = hasMultipleItems ? service.item_name.length - 1 : 0;

            return (
              <tr key={service.id} className={`${getStatusHighlightStyle(service.status)} transition-colors duration-150`}>
                <td className="px-4 py-4 align-top text-sm text-gray-500 font-mono">{service.id}</td>
                <td className="px-4 py-4 align-top text-sm text-gray-700">
                  {new Date(service.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {service.deadline && <div className="mt-1">{formatDeadline(service.deadline)}</div>}
                </td>
                <td className="px-4 py-4 align-top text-sm break-words">
                  <div className="font-medium text-gray-900">{service.customer_name}</div>
                  <div className="text-gray-500">{service.customer_phone}</div>
                </td>
                
                {/* --- PERBAIKAN: Tampilan Ringkasan Item --- */}
                <td className="px-4 py-4 align-top text-sm text-gray-800 break-words">
                  <div>
                    <div className="font-semibold text-gray-900">{firstItemName}</div>
                    {firstItemDamage && <div className="text-gray-600 text-xs pl-2">- {firstItemDamage}</div>}
                  </div>
                  {hasMultipleItems && (
                    <div className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 cursor-pointer" onClick={() => onEdit(service)}>
                      <MoreHorizontal size={14} />
                      <span>Lihat {remainingItemsCount} barang lainnya...</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 align-top text-sm">
                  <select value={service.status} onChange={(e) => handleStatusChange(service, e.target.value)} data-id={service.id} className="p-1.5 border border-gray-300 rounded-md bg-white w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Masuk">Masuk</option>
                    <option value="Pengecekan">Pengecekan</option>
                    <option value="Dikerjakan">Dikerjakan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Diambil">Diambil</option>
                    <option value="Batal">Batal</option>
                  </select>
                </td>
                <td className="px-4 py-4 align-top text-center text-sm font-medium">
                    <div className="flex justify-center gap-3">
                        <button onClick={() => onEdit(service)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Edit / Lihat Detail"><Edit size={18}/></button>
                        <button onClick={() => onDelete(service.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Hapus"><Trash2 size={18}/></button>
                    </div>
                </td>
              </tr>
            )
         })}
        </tbody>
      </table>
    </div>
  );
}

export default ServiceTable;
