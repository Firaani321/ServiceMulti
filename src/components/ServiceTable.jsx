import React from 'react';
import { Edit, Trash2, Clock, Info } from 'lucide-react';

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
    return <div className="text-center py-10 text-gray-500">Tidak ada data untuk ditampilkan.</div>;
  }

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
    const date = new Date(deadline + 'T00:00:00'); // Tambahkan T00:00:00 agar tidak terpengaruh timezone
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
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full text-sm align-top">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Tanggal</th>
            <th className="p-3 text-left">Pelanggan</th>
            <th className="p-3 text-left">Barang & Kerusakan</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
         {services.map((service, index) => (
            <tr 
              key={service.id} 
              className={`border-b ${getStatusHighlightStyle(service.status)} ${service.high_priority ? 'border-l-4 border-red-500' : ''} animate-slide-in-top`}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <td className="p-3 font-mono text-xs">{service.id}</td>
              <td className="p-3">
                {new Date(service.created_at).toLocaleDateString('id-ID')}
                {service.deadline && <div className="mt-1">{formatDeadline(service.deadline)}</div>}
              </td>
              <td className="p-3">{service.customer_name}<br/><small className="text-gray-500">{service.customer_phone}</small></td>
              <td className="p-3">
                {Array.isArray(service.item_name) ? (
                  <ul className="space-y-2">
                    {service.item_name.map((item, i) => (
                      <li key={i}>
                        <div className="font-semibold">{item}</div>
                        {service.item_damage && service.item_damage[i] && <div className="text-gray-600 text-xs pl-2">- {service.item_damage[i]}</div>}
                        {service.item_notes && service.item_notes[i] && <div className="text-blue-600 text-xs pl-2 flex items-start gap-1"><Info size={12} className="mt-0.5"/> <span>{service.item_notes[i]}</span></div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>
                    <div className="font-semibold">{service.item_name}</div>
                    {service.item_damage && <div className="text-gray-600 text-xs">- {service.item_damage}</div>}
                  </div>
                )}
              </td>
              <td className="p-3">
                <select value={service.status} onChange={(e) => handleStatusChange(service, e.target.value)} data-id={service.id} className="p-1 border rounded bg-white w-full">
                  <option value="Masuk">Masuk</option>
                  <option value="Pengecekan">Pengecekan</option>
                  <option value="Dikerjakan">Dikerjakan</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Diambil">Diambil</option>
                  <option value="Batal">Batal</option>
                </select>
              </td>
              <td className="p-3 text-center">
                  <div className="flex justify-center gap-1">
                      <button onClick={() => onEdit(service)} className="p-2 hover:bg-gray-200 rounded-full" title="Edit"><Edit size={16}/></button>
                      <button onClick={() => onDelete(service.id)} className="p-2 hover:bg-gray-200 rounded-full" title="Hapus"><Trash2 size={16}/></button>
                  </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ServiceTable;