import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MietverhaeltnisBearbeiten() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  
  const [mietobjektAdresse, setMietobjektAdresse] = useState('');

  const [formData, setFormData] = useState({
    mieterName: '',
    status: 'AKTIV',
    kaution: 0,
    kaltMiete: 0,
    nebenkosten: 0,
    startDatum: '',
    endeDatum: ''
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/mietverhaeltnisse/${id}`)
        .then(res => res.json())
        .then(response => {
          const data = response.data || response;
          
          setFormData({
            mieterName: data.mieter?.name || data.mieterName || '',
            status: data.status || 'AKTIV',
            kaution: data.kaution || 0,
            kaltMiete: data.mietobjekt?.kaltMiete || data.kaltMiete || 0,
            nebenkosten: data.mietobjekt?.nebenkosten || data.nebenkosten || 0,
            startDatum: data.startDatum ? data.startDatum.split('T')[0] : '',
            endeDatum: data.endeDatum ? data.endeDatum.split('T')[0] : ''
          });
          
          if (data.mietobjekt) {
            setMietobjektAdresse(data.mietobjekt.adresse || '');
          }
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/mietverhaeltnisse/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/mietverhaeltnisse/${id}`);
      } else {
        alert('Hata: Kaydedilemedi');
      }
    } catch (error) {
      alert('Sistem hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mietverhältnis bearbeiten</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mieter Name</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
            value={formData.mieterName} 
            onChange={e => setFormData({...formData, mieterName: e.target.value})} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mietobjekt Adresse</label>
          <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-700">
            {mietobjektAdresse || 'Adresse wird geladen...'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kaltmiete (€)</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
              value={formData.kaltMiete} 
              onChange={e => setFormData({...formData, kaltMiete: Number(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nebenkosten (€)</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
              value={formData.nebenkosten} 
              onChange={e => setFormData({...formData, nebenkosten: Number(e.target.value)})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kaution (€)</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
              value={formData.kaution} 
              onChange={e => setFormData({...formData, kaution: Number(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="AKTIV">Aktiv</option>
              <option value="BEENDET">Beendet</option>
              <option value="GEKUENDIGT">Gekündigt</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
              value={formData.startDatum} 
              onChange={e => setFormData({...formData, startDatum: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endedatum</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
              value={formData.endeDatum} 
              onChange={e => setFormData({...formData, endeDatum: e.target.value})} 
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}