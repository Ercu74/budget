import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MietobjektBearbeiten() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    adresse: '',
    zimmer: 0,
    flaeche: 0,
    kaltMiete: 0,
    nebenkosten: 0,
    status: 'FREI', // Prisma: MietobjektStatus Enum
    bemerkungen: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/mietobjekte/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            adresse: data.adresse || '',
            zimmer: data.zimmer || 0,
            flaeche: data.flaeche || 0,
            kaltMiete: data.kaltMiete || 0,
            nebenkosten: data.nebenkosten || 0,
            status: data.status || 'FREI',
            bemerkungen: data.bemerkungen || ''
          });
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Prisma şemasına göre sayısal dönüşümler
    const payload = {
      adresse: formData.adresse,
      zimmer: Number(formData.zimmer), // Int
      flaeche: Number(formData.flaeche), // Float
      kaltMiete: Number(formData.kaltMiete), // Float
      nebenkosten: Number(formData.nebenkosten), // Float
      status: formData.status, // Enum
      bemerkungen: formData.bemerkungen
    };

    const res = await fetch(`/api/mietobjekte/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Değişikliklerin anında görünmesi için yönlendirme ve tazeleme
      await router.push(`/mietobjekte/${id}`);
      router.reload(); 
    } else {
      alert('Hata: Güncellenemedi');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mietobjekt bearbeiten</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border">
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Adresse</label>
          <input 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.adresse} 
            onChange={e => setFormData({...formData, adresse: e.target.value})} 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Zimmer</label>
            <input 
              type="number"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.zimmer} 
              onChange={e => setFormData({...formData, zimmer: Number(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Fläche (m²)</label>
            <input 
              type="number"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.flaeche} 
              onChange={e => setFormData({...formData, flaeche: Number(e.target.value)})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Kaltmiete (€)</label>
            <input 
              type="number"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
              value={formData.kaltMiete} 
              onChange={e => setFormData({...formData, kaltMiete: Number(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Nebenkosten (€)</label>
            <input 
              type="number"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.nebenkosten} 
              onChange={e => setFormData({...formData, nebenkosten: Number(e.target.value)})} 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Status</label>
          <select 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            {/* Şemadaki MietobjektStatus Enum değerleri */}
            <option value="FREI">Frei</option>
            <option value="VERMIETET">Vermietet</option>
            <option value="INSTANDHALTUNG">Instandhaltung</option>
          </select>
        </div>

        <div className="pt-4 flex gap-3 text-white font-bold">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-all">
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-500 rounded-lg hover:bg-gray-600 transition-all">
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}