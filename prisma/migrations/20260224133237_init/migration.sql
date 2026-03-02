-- CreateEnum
CREATE TYPE "Rolle" AS ENUM ('ADMIN', 'VERMIETER', 'MIETER');

-- CreateEnum
CREATE TYPE "MietobjektStatus" AS ENUM ('FREI', 'VERMIETET', 'INSTANDHALTUNG');

-- CreateEnum
CREATE TYPE "MietverhaeltnisStatus" AS ENUM ('AKTIV', 'BEENDET', 'GEKUENDIGT');

-- CreateEnum
CREATE TYPE "ZahlungStatus" AS ENUM ('BEZAHLT', 'AUSSTEHEND', 'VERSPAETET');

-- CreateEnum
CREATE TYPE "Zahlungsmethode" AS ENUM ('BAR', 'UBERWEISUNG', 'LASTSCHRIFT');

-- CreateTable
CREATE TABLE "Benutzer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwort" TEXT,
    "name" TEXT,
    "rolle" "Rolle" NOT NULL DEFAULT 'MIETER',
    "bild" TEXT,
    "erstellDatum" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualisiert" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Benutzer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mietobjekt" (
    "id" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "zimmer" INTEGER NOT NULL,
    "flaeche" DOUBLE PRECISION NOT NULL,
    "kaltMiete" DOUBLE PRECISION NOT NULL,
    "nebenkosten" DOUBLE PRECISION NOT NULL,
    "gesamtMiete" DOUBLE PRECISION NOT NULL,
    "status" "MietobjektStatus" NOT NULL DEFAULT 'FREI',
    "bemerkungen" TEXT,
    "erstellDatum" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualisiert" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mietobjekt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mietverhaeltnis" (
    "id" TEXT NOT NULL,
    "mietobjektId" TEXT NOT NULL,
    "vermieterId" TEXT NOT NULL,
    "mieterId" TEXT NOT NULL,
    "startDatum" TIMESTAMP(3) NOT NULL,
    "endeDatum" TIMESTAMP(3),
    "kaution" DOUBLE PRECISION,
    "status" "MietverhaeltnisStatus" NOT NULL DEFAULT 'AKTIV',
    "erstellDatum" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualisiert" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mietverhaeltnis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zahlung" (
    "id" TEXT NOT NULL,
    "mietverhaeltnisId" TEXT NOT NULL,
    "betrag" DOUBLE PRECISION NOT NULL,
    "zahlungsdatum" TIMESTAMP(3) NOT NULL,
    "methode" "Zahlungsmethode" NOT NULL,
    "status" "ZahlungStatus" NOT NULL DEFAULT 'AUSSTEHEND',
    "bemerkungen" TEXT,
    "erstellDatum" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktualisiert" TIMESTAMP(3) NOT NULL,
    "erstellerId" TEXT NOT NULL,

    CONSTRAINT "Zahlung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AktivitaetsLog" (
    "id" TEXT NOT NULL,
    "benutzerId" TEXT NOT NULL,
    "aktion" TEXT NOT NULL,
    "details" TEXT,
    "ipAdresse" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AktivitaetsLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Benutzer_email_key" ON "Benutzer"("email");

-- AddForeignKey
ALTER TABLE "Mietverhaeltnis" ADD CONSTRAINT "Mietverhaeltnis_mietobjektId_fkey" FOREIGN KEY ("mietobjektId") REFERENCES "Mietobjekt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mietverhaeltnis" ADD CONSTRAINT "Mietverhaeltnis_vermieterId_fkey" FOREIGN KEY ("vermieterId") REFERENCES "Benutzer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mietverhaeltnis" ADD CONSTRAINT "Mietverhaeltnis_mieterId_fkey" FOREIGN KEY ("mieterId") REFERENCES "Benutzer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zahlung" ADD CONSTRAINT "Zahlung_mietverhaeltnisId_fkey" FOREIGN KEY ("mietverhaeltnisId") REFERENCES "Mietverhaeltnis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zahlung" ADD CONSTRAINT "Zahlung_erstellerId_fkey" FOREIGN KEY ("erstellerId") REFERENCES "Benutzer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AktivitaetsLog" ADD CONSTRAINT "AktivitaetsLog_benutzerId_fkey" FOREIGN KEY ("benutzerId") REFERENCES "Benutzer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
