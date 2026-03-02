import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ZahlungBearbeiten() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/zahlungen/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            ...data,
            // Tarih verisini HTML date input'un anlayacağı formata (YYYY-MM-DD) çeviriyoruz
            zahlungsdatum: data.zahlungsdatum ? data.zahlungsdatum.split('T')[0] : '',
            betrag: data.betrag || 0,
            status: data.status || 'OFFEN',
            belegUrl: data.belegUrl || ''
          });
        })
        .catch(err => console.error("Fehler beim Laden der Daten:", err));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/zahlungen/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/zahlungen/${id}`);
      } else {
        const errorData = await res.json();
        alert(`Fehler beim Speichern: ${errorData.message || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error("Update Fehler:", error);
      alert('Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500 font-medium text-xl">Lade Zahlungsdaten...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <form 
        onSubmit={handleSubmit} 
        className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6"
      >
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Zahlung bearbeiten
          </h1>
          <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded">
            ID: {id}
          </span>
        </div>

        {/* BETRAG UND DATUM - GRID YAPI BİREBİR KORUNDU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
              Betrag (€)
            </label>
            <input 
              type="number" 
              step="0.01"
              required
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" 
              value={formData.betrag} 
              onChange={e => setFormData({...formData, betrag: parseFloat(e.target.value)})} 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
              Zahlungsdatum
            </label>
            <input 
              type="date" 
              required
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" 
              value={formData.zahlungsdatum} 
              onChange={e => setFormData({...formData, zahlungsdatum: e.target.value})} 
            />
          </div>
        </div>

        {/* STATUS SELECTION */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
            Zahlungsstatus
          </label>
          <select 
            className="w-full border border-gray-300 p-3 rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm appearance-none cursor-pointer" 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            <option value="OFFEN">Offen</option>
            <option value="BEZAHLT">Bezahlt</option>
            <option value="UEBERFAELLIG">Überfällig</option>
            <option value="TEILWEISE">Teilweise bezahlt</option>
          </select>
        </div>

        {/* DOKUMENT / BELEG URL */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
            Beleg URL (Optional)
          </label>
          <input 
            type="text" 
            placeholder="https://..."
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" 
            value={formData.belegUrl} 
            onChange={e => setFormData({...formData, belegUrl: e.target.value})} 
          />
        </div>

        {/* BUTTON GROUP - MIETVERHAELTNISSE İLE AYNI TASARIM */}
        <div className="pt-8 flex items-center gap-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 bg-[#1a237e] text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-900 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? 'Speichern...' : 'Änderungen speichern'}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all shadow-sm"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}