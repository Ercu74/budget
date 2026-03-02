-- DropForeignKey
ALTER TABLE "AktivitaetsLog" DROP CONSTRAINT "AktivitaetsLog_benutzerId_fkey";

-- DropForeignKey
ALTER TABLE "Mietverhaeltnis" DROP CONSTRAINT "Mietverhaeltnis_mieterId_fkey";

-- DropForeignKey
ALTER TABLE "Mietverhaeltnis" DROP CONSTRAINT "Mietverhaeltnis_mietobjektId_fkey";

-- DropForeignKey
ALTER TABLE "Mietverhaeltnis" DROP CONSTRAINT "Mietverhaeltnis_vermieterId_fkey";

-- DropForeignKey
ALTER TABLE "Zahlung" DROP CONSTRAINT "Zahlung_erstellerId_fkey";

-- DropForeignKey
ALTER TABLE "Zahlung" DROP CONSTRAINT "Zahlung_mietverhaeltnisId_fkey";

-- AlterTable
ALTER TABLE "AktivitaetsLog" ALTER COLUMN "benutzerId" DROP NOT NULL,
ALTER COLUMN "aktion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Mietobjekt" ALTER COLUMN "adresse" DROP NOT NULL,
ALTER COLUMN "zimmer" DROP NOT NULL,
ALTER COLUMN "flaeche" DROP NOT NULL,
ALTER COLUMN "kaltMiete" DROP NOT NULL,
ALTER COLUMN "nebenkosten" DROP NOT NULL,
ALTER COLUMN "gesamtMiete" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Mietverhaeltnis" ALTER COLUMN "mietobjektId" DROP NOT NULL,
ALTER COLUMN "vermieterId" DROP NOT NULL,
ALTER COLUMN "mieterId" DROP NOT NULL,
ALTER COLUMN "startDatum" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Zahlung" ALTER COLUMN "mietverhaeltnisId" DROP NOT NULL,
ALTER COLUMN "betrag" DROP NOT NULL,
ALTER COLUMN "zahlungsdatum" DROP NOT NULL,
ALTER COLUMN "methode" DROP NOT NULL,
ALTER COLUMN "erstellerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Mietverhaeltnis" ADD CONSTRAINT "Mietverhaeltnis_mietobjektId_fkey" FOREIGN KEY ("mietobjektId") REFERENCES "Mietobjekt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mietverhaeltnis" ADD CONSTRAINT "Mietverhaeltnis_vermieterId_fkey" FOREIGN KEY ("vermieterId") REFERENCES "Benutzer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mietverhaeltnis" ADD CONSTRAINT "Mietverhaeltnis_mieterId_fkey" FOREIGN KEY ("mieterId") REFERENCES "Benutzer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zahlung" ADD CONSTRAINT "Zahlung_mietverhaeltnisId_fkey" FOREIGN KEY ("mietverhaeltnisId") REFERENCES "Mietverhaeltnis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zahlung" ADD CONSTRAINT "Zahlung_erstellerId_fkey" FOREIGN KEY ("erstellerId") REFERENCES "Benutzer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AktivitaetsLog" ADD CONSTRAINT "AktivitaetsLog_benutzerId_fkey" FOREIGN KEY ("benutzerId") REFERENCES "Benutzer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
