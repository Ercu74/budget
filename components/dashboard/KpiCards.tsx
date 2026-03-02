import { 
  HomeIcon, 
  UsersIcon, 
  CurrencyEuroIcon, 
  ExclamationTriangleIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { DashboardProps } from './types'
import Link from 'next/link'

export default function KpiCards(props: DashboardProps) {
  const stats = [
    {
      name: 'Gesamte Objekte',
      value: props.anzahlObjekte,
      icon: HomeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/mietobjekte' // Tüm objelere gitmek için link eklendi
    },
    {
      // İsteğin üzerine güncellenen kısım:
      name: 'Vermietete Wohnungen',
      value: props.anzahlAktiveVertraege,
      icon: UsersIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/mietverhaeltnisse' // Kiralanan evlerin listesine yönlendirir
    },
    {
      name: 'Ausstehende Zahlungen',
      value: props.anzahlAusstehendeZahlungen,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/zahlungen?filter=ausstehend'
    },
    {
      name: 'Soll-Miete (Gesamt)',
      value: `${props.sollMiete.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`,
      icon: BanknotesIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Erhaltene Zahlungen',
      value: `${props.erhalteneZahlungen.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`,
      icon: CurrencyEuroIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      href: '/zahlungen?status=ERHALTEN'
    },
    {
      name: 'Offener Betrag',
      value: `${props.offeneForderungen.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/zahlungen/offen'
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {stats.map((item) => {
        const CardContent = (
          <div className={`relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6 transition-all duration-200 ${item.href ? 'hover:bg-gray-50 hover:shadow-md cursor-pointer' : ''}`}>
            <dt>
              <div className={`absolute rounded-md p-3 ${item.bgColor}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </dd>
          </div>
        );

        return item.href ? (
          <Link key={item.name} href={item.href} className="no-underline">
            {CardContent}
          </Link>
        ) : (
          <div key={item.name}>{CardContent}</div>
        );
      })}
    </div>
  )
}