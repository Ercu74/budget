export interface DashboardProps {
  // Statistische Grunddaten
  anzahlObjekte: number;             // mietobjekteCount
  anzahlAktiveVertraege: number;     // aktiveVertraegeCount
  anzahlAusstehendeZahlungen: number; // ausstehendeZahlungenCount

  // Finanzielle Kennzahlen
  erhalteneZahlungen: number;        // toplamGelir (Ist)
  offeneForderungen: number;         // acikOdemeler (Soll - Ist)
  sollMiete: number;                 // beklenenGelir (Soll)

  // Listen für Tabellen
  ueberfaelligeZahlungen: {          // vadesiGecmisOdemeler
    id: string;
    betrag: number;
    zahlungsdatum: string;           // faelligkeitsDatum yerine
    mieter: string;
    mietobjekt: string;
    tageUeberfaellig: number;
  }[];

  leerstehendeObjekte: {             // bosMietobjekte
    id: string;
    adresse: string;
    gesamtMiete: number;
    status: string;
  }[];

  auslaufendeVertraege: {            // baldAblaufendeVertraege
    id: string;
    mietobjekt: string;
    mieter: string;
    mietende: string;                // endeDatum yerine
    tageBisAblauf: number;
  }[];
}