import { COMPANY } from "@/lib/company";
import type { Locale } from "@/i18n/config";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  /** Elenco puntato opzionale in coda ai paragrafi. */
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

/** Data dell'ultima revisione dei testi legali. */
export const LEGAL_UPDATED = "2026-08-12";

const IDENTITY = {
  it: `${COMPANY.legalName}, ${COMPANY.registeredOffice.street}, ${COMPANY.registeredOffice.postalCode} ${COMPANY.registeredOffice.city} (${COMPANY.registeredOffice.province}), P.IVA e C.F. ${COMPANY.vat}, REA ${COMPANY.rea}, PEC ${COMPANY.pec}, telefono ${COMPANY.phone}`,
  de: `${COMPANY.legalName}, ${COMPANY.registeredOffice.street}, ${COMPANY.registeredOffice.postalCode} ${COMPANY.registeredOffice.city} (${COMPANY.registeredOffice.province}), MwSt.-Nr. und St.-Nr. ${COMPANY.vat}, REA ${COMPANY.rea}, PEC ${COMPANY.pec}, Telefon ${COMPANY.phone}`,
  en: `${COMPANY.legalName}, ${COMPANY.registeredOffice.street}, ${COMPANY.registeredOffice.postalCode} ${COMPANY.registeredOffice.city} (${COMPANY.registeredOffice.province}), VAT and tax code ${COMPANY.vat}, REA ${COMPANY.rea}, certified email ${COMPANY.pec}, telephone ${COMPANY.phone}`,
} as const;

/* ------------------------------------------------------------------ *
 * INFORMATIVA PRIVACY
 * ------------------------------------------------------------------ */
const PRIVACY: Record<Locale, LegalDocument> = {
  it: {
    title: "Informativa sul trattamento dei dati personali",
    intro:
      "Ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 (GDPR) e del D.lgs. 196/2003 come modificato dal D.lgs. 101/2018, illustriamo come vengono trattati i dati personali raccolti attraverso questo sito e nell'ambito dell'attività di intermediazione immobiliare.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        id: "titolare",
        title: "1. Titolare del trattamento",
        paragraphs: [
          `Il titolare del trattamento è ${IDENTITY.it}.`,
          `Non è stato nominato un Responsabile della Protezione dei Dati (DPO), non ricorrendo i presupposti dell'art. 37 GDPR. Ogni richiesta relativa ai dati personali va indirizzata alla PEC ${COMPANY.pec}.`,
        ],
      },
      {
        id: "dati",
        title: "2. Categorie di dati trattati",
        paragraphs: ["A seconda dell'interazione con il sito e con l'agenzia, trattiamo:"],
        bullets: [
          "dati anagrafici e di contatto (nome, cognome, e-mail, telefono) forniti tramite i moduli di contatto, di richiesta brochure, di valutazione e di iscrizione alla newsletter;",
          "dati relativi all'immobile oggetto di incarico o di interesse (indirizzo, superficie, dati catastali, documentazione tecnica ed energetica);",
          "dati di navigazione raccolti automaticamente dai sistemi informatici (indirizzo IP, tipo di browser, pagine visitate, orari di accesso), utilizzati in forma aggregata per motivi di sicurezza e statistica;",
          "un identificativo pseudonimo derivato dall'indirizzo IP, calcolato al momento dell'invio dei moduli al solo fine di limitare gli invii automatizzati. L'indirizzo non viene conservato in chiaro, l'identificativo non è associato alla richiesta inviata e viene cancellato entro 48 ore;",
          "dati necessari agli adempimenti antiriciclaggio (D.lgs. 231/2007) in fase di conferimento dell'incarico o di conclusione dell'affare, inclusi documento d'identità e codice fiscale.",
        ],
      },
      {
        id: "finalita",
        title: "3. Finalità e basi giuridiche",
        paragraphs: [
          "I dati sono trattati per le seguenti finalità, ciascuna con la propria base giuridica:",
        ],
        bullets: [
          "riscontro alle richieste di informazioni e gestione del rapporto precontrattuale — art. 6.1.b GDPR (misure precontrattuali su richiesta dell'interessato);",
          "esecuzione dell'incarico di mediazione e dei relativi adempimenti — art. 6.1.b GDPR;",
          "obblighi di legge fiscali, contabili e antiriciclaggio — art. 6.1.c GDPR;",
          "invio della newsletter e delle segnalazioni di immobili off-market — art. 6.1.a GDPR (consenso, revocabile in ogni momento);",
          "cookie analitici e di marketing — art. 6.1.a GDPR (consenso raccolto tramite il banner);",
          "sicurezza del sito e prevenzione degli invii automatizzati sui moduli — art. 6.1.f GDPR (legittimo interesse del titolare a mantenere il servizio disponibile e utilizzabile);",
          "difesa in giudizio e tutela del credito — art. 6.1.f GDPR (legittimo interesse del titolare).",
        ],
      },
      {
        id: "conferimento",
        title: "4. Natura del conferimento",
        paragraphs: [
          "Il conferimento dei dati contrassegnati come obbligatori nei moduli è necessario per dare seguito alla richiesta: in mancanza non è possibile rispondere o dare esecuzione all'incarico. Il conferimento dei dati per finalità di marketing è facoltativo e il rifiuto non pregiudica gli altri servizi.",
        ],
      },
      {
        id: "destinatari",
        title: "5. Destinatari e categorie di destinatari",
        paragraphs: [
          "I dati possono essere comunicati a soggetti che agiscono come responsabili del trattamento ai sensi dell'art. 28 GDPR o come titolari autonomi:",
        ],
        bullets: [
          "fornitori di servizi informatici, hosting, posta elettronica e manutenzione del sito;",
          "professionisti incaricati (notai, geometri, avvocati, commercialisti, periti estimatori) nei limiti necessari alla conclusione dell'affare;",
          "istituti di credito e intermediari finanziari, su richiesta dell'interessato;",
          "pubbliche amministrazioni e autorità nei casi previsti dalla legge.",
          "I dati non sono oggetto di diffusione né di vendita a terzi.",
        ],
      },
      {
        id: "trasferimenti",
        title: "6. Trasferimenti extra UE",
        paragraphs: [
          "I dati sono conservati su server situati nello Spazio Economico Europeo. Qualora un fornitore comportasse un trasferimento verso Paesi terzi, questo avverrà esclusivamente in presenza di una decisione di adeguatezza della Commissione europea o di clausole contrattuali tipo ai sensi dell'art. 46 GDPR, con le misure supplementari eventualmente necessarie.",
        ],
      },
      {
        id: "conservazione",
        title: "7. Periodo di conservazione",
        paragraphs: [
          "I dati di contatto raccolti per riscontrare una richiesta sono conservati per 24 mesi dall'ultimo contatto utile. I dati relativi a incarichi conclusi sono conservati per 10 anni ai fini fiscali e civilistici; la documentazione antiriciclaggio per 10 anni ai sensi del D.lgs. 231/2007. I dati trattati sulla base del consenso sono conservati fino alla revoca del consenso stesso.",
        ],
      },
      {
        id: "diritti",
        title: "8. Diritti dell'interessato",
        paragraphs: [
          "In qualsiasi momento è possibile esercitare i diritti previsti dagli articoli 15-22 GDPR:",
        ],
        bullets: [
          "accesso ai propri dati e alle informazioni sul trattamento;",
          "rettifica dei dati inesatti e integrazione di quelli incompleti;",
          "cancellazione (diritto all'oblio) nei casi previsti dall'art. 17;",
          "limitazione del trattamento e opposizione ai trattamenti basati sul legittimo interesse;",
          "portabilità dei dati forniti, in formato strutturato e leggibile da dispositivo automatico;",
          "revoca del consenso in qualsiasi momento, senza pregiudicare la liceità del trattamento precedente.",
          `Le richieste vanno inviate alla PEC ${COMPANY.pec} e ricevono riscontro entro 30 giorni.`,
        ],
      },
      {
        id: "reclamo",
        title: "9. Reclamo all'autorità di controllo",
        paragraphs: [
          "L'interessato che ritenga illegittimo il trattamento può proporre reclamo al Garante per la protezione dei dati personali (Piazza Venezia 11, 00187 Roma — www.garanteprivacy.it) o ricorrere all'autorità giudiziaria.",
        ],
      },
      {
        id: "modifiche",
        title: "10. Modifiche all'informativa",
        paragraphs: [
          "La presente informativa può essere aggiornata per adeguamenti normativi o per modifiche ai servizi offerti. La versione vigente è sempre pubblicata su questa pagina con l'indicazione della data di ultimo aggiornamento.",
        ],
      },
    ],
  },

  de: {
    title: "Informationen zur Verarbeitung personenbezogener Daten",
    intro:
      "Gemäß Art. 13 und 14 der Verordnung (EU) 2016/679 (DSGVO) und des GvD 196/2003 in der Fassung des GvD 101/2018 erläutern wir, wie die über diese Website und im Rahmen der Immobilienvermittlung erhobenen personenbezogenen Daten verarbeitet werden.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        id: "titolare",
        title: "1. Verantwortlicher",
        paragraphs: [
          `Verantwortlicher für die Verarbeitung ist ${IDENTITY.de}.`,
          `Ein Datenschutzbeauftragter wurde nicht bestellt, da die Voraussetzungen von Art. 37 DSGVO nicht vorliegen. Anfragen zu personenbezogenen Daten sind an die PEC-Adresse ${COMPANY.pec} zu richten.`,
        ],
      },
      {
        id: "dati",
        title: "2. Kategorien verarbeiteter Daten",
        paragraphs: ["Je nach Interaktion mit der Website und dem Büro verarbeiten wir:"],
        bullets: [
          "Stamm- und Kontaktdaten (Vorname, Nachname, E-Mail, Telefon) aus den Kontakt-, Exposé-, Bewertungs- und Newsletter-Formularen;",
          "Daten zur beauftragten oder nachgefragten Immobilie (Adresse, Fläche, Katasterdaten, technische und energetische Unterlagen);",
          "automatisch erhobene Navigationsdaten (IP-Adresse, Browsertyp, aufgerufene Seiten, Zugriffszeiten), die aggregiert zu Sicherheits- und Statistikzwecken genutzt werden;",
          "eine aus der IP-Adresse abgeleitete pseudonyme Kennung, die beim Absenden der Formulare ausschließlich zur Begrenzung automatisierter Übermittlungen berechnet wird. Die Adresse wird nicht im Klartext gespeichert, die Kennung wird der Anfrage nicht zugeordnet und innerhalb von 48 Stunden gelöscht;",
          "Daten für die Geldwäscheprävention (GvD 231/2007) bei Auftragserteilung oder Geschäftsabschluss, einschließlich Ausweisdokument und Steuernummer.",
        ],
      },
      {
        id: "finalita",
        title: "3. Zwecke und Rechtsgrundlagen",
        paragraphs: ["Die Daten werden zu folgenden Zwecken mit jeweils eigener Rechtsgrundlage verarbeitet:"],
        bullets: [
          "Beantwortung von Anfragen und Abwicklung des vorvertraglichen Verhältnisses — Art. 6 Abs. 1 lit. b DSGVO;",
          "Durchführung des Vermittlungsauftrags und der damit verbundenen Pflichten — Art. 6 Abs. 1 lit. b DSGVO;",
          "steuerliche, buchhalterische und geldwäscherechtliche Pflichten — Art. 6 Abs. 1 lit. c DSGVO;",
          "Versand des Newsletters und der Off-Market-Angebote — Art. 6 Abs. 1 lit. a DSGVO (jederzeit widerrufbare Einwilligung);",
          "Analyse- und Marketing-Cookies — Art. 6 Abs. 1 lit. a DSGVO (Einwilligung über das Banner);",
          "Sicherheit der Website und Abwehr automatisierter Formularübermittlungen — Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem verfügbaren und nutzbaren Dienst);",
          "Rechtsverteidigung und Forderungssicherung — Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).",
        ],
      },
      {
        id: "conferimento",
        title: "4. Erforderlichkeit der Angaben",
        paragraphs: [
          "Die als Pflichtfelder gekennzeichneten Angaben sind erforderlich, um die Anfrage zu bearbeiten; ohne sie können wir nicht antworten oder den Auftrag nicht ausführen. Die Angabe von Daten zu Marketingzwecken ist freiwillig; eine Verweigerung beeinträchtigt die übrigen Leistungen nicht.",
        ],
      },
      {
        id: "destinatari",
        title: "5. Empfänger und Empfängerkategorien",
        paragraphs: [
          "Die Daten können an Auftragsverarbeiter im Sinne von Art. 28 DSGVO oder an eigenständig Verantwortliche übermittelt werden:",
        ],
        bullets: [
          "IT-, Hosting-, E-Mail- und Website-Wartungsdienstleister;",
          "beauftragte Fachleute (Notare, Geometer, Rechtsanwälte, Steuerberater, Schätzgutachter), soweit für den Abschluss erforderlich;",
          "Kreditinstitute und Finanzintermediäre auf Wunsch der betroffenen Person;",
          "Behörden und öffentliche Stellen in den gesetzlich vorgesehenen Fällen.",
          "Eine Verbreitung oder ein Verkauf der Daten an Dritte findet nicht statt.",
        ],
      },
      {
        id: "trasferimenti",
        title: "6. Übermittlung in Drittländer",
        paragraphs: [
          "Die Daten werden auf Servern im Europäischen Wirtschaftsraum gespeichert. Sollte ein Dienstleister eine Übermittlung in Drittländer erfordern, erfolgt diese ausschließlich auf Grundlage eines Angemessenheitsbeschlusses der Europäischen Kommission oder von Standardvertragsklauseln gemäß Art. 46 DSGVO, gegebenenfalls mit ergänzenden Maßnahmen.",
        ],
      },
      {
        id: "conservazione",
        title: "7. Speicherdauer",
        paragraphs: [
          "Kontaktdaten aus Anfragen werden 24 Monate ab dem letzten Kontakt aufbewahrt. Daten abgeschlossener Aufträge werden aus steuer- und zivilrechtlichen Gründen 10 Jahre aufbewahrt; Unterlagen zur Geldwäscheprävention 10 Jahre gemäß GvD 231/2007. Auf Einwilligung gestützte Daten werden bis zum Widerruf aufbewahrt.",
        ],
      },
      {
        id: "diritti",
        title: "8. Rechte der betroffenen Person",
        paragraphs: ["Jederzeit können die Rechte nach Art. 15–22 DSGVO ausgeübt werden:"],
        bullets: [
          "Auskunft über die eigenen Daten und die Verarbeitung;",
          "Berichtigung unrichtiger und Vervollständigung unvollständiger Daten;",
          "Löschung (Recht auf Vergessenwerden) in den Fällen des Art. 17;",
          "Einschränkung der Verarbeitung und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen;",
          "Datenübertragbarkeit in einem strukturierten, maschinenlesbaren Format;",
          "jederzeitiger Widerruf der Einwilligung, unbeschadet der Rechtmäßigkeit der bisherigen Verarbeitung.",
          `Anfragen sind an die PEC-Adresse ${COMPANY.pec} zu richten und werden innerhalb von 30 Tagen beantwortet.`,
        ],
      },
      {
        id: "reclamo",
        title: "9. Beschwerde bei der Aufsichtsbehörde",
        paragraphs: [
          "Wer die Verarbeitung für rechtswidrig hält, kann Beschwerde bei der italienischen Datenschutzbehörde (Garante per la protezione dei dati personali, Piazza Venezia 11, 00187 Rom — www.garanteprivacy.it) einlegen oder den Rechtsweg beschreiten.",
        ],
      },
      {
        id: "modifiche",
        title: "10. Änderungen dieser Information",
        paragraphs: [
          "Diese Datenschutzinformation kann aufgrund gesetzlicher Änderungen oder Anpassungen der Leistungen aktualisiert werden. Die jeweils gültige Fassung ist auf dieser Seite mit Datum der letzten Aktualisierung veröffentlicht.",
        ],
      },
    ],
  },

  en: {
    title: "Information on the processing of personal data",
    intro:
      "Pursuant to Articles 13 and 14 of Regulation (EU) 2016/679 (GDPR) and Italian Legislative Decree 196/2003 as amended by Legislative Decree 101/2018, this notice explains how personal data collected through this website and in the course of our brokerage activity is processed.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        id: "titolare",
        title: "1. Data controller",
        paragraphs: [
          `The data controller is ${IDENTITY.en}.`,
          `No Data Protection Officer has been appointed, as the conditions of Article 37 GDPR do not apply. Any request concerning personal data should be sent to ${COMPANY.pec}.`,
        ],
      },
      {
        id: "dati",
        title: "2. Categories of data processed",
        paragraphs: ["Depending on how you interact with the site and the agency, we process:"],
        bullets: [
          "identification and contact data (first name, surname, email, telephone) provided through the contact, brochure request, valuation and newsletter forms;",
          "data concerning the property under mandate or of interest (address, surface area, cadastral data, technical and energy documentation);",
          "browsing data automatically collected by our systems (IP address, browser type, pages visited, access times), used in aggregate form for security and statistical purposes;",
          "a pseudonymous identifier derived from the IP address, computed when forms are submitted for the sole purpose of limiting automated submissions. The address is not stored in clear text, the identifier is not linked to the request sent, and it is deleted within 48 hours;",
          "data required by anti-money-laundering rules (Legislative Decree 231/2007) when a mandate is signed or a deal is concluded, including identity document and tax code.",
        ],
      },
      {
        id: "finalita",
        title: "3. Purposes and legal bases",
        paragraphs: ["Data is processed for the following purposes, each with its own legal basis:"],
        bullets: [
          "responding to information requests and managing the pre-contractual relationship — Art. 6(1)(b) GDPR;",
          "performing the brokerage mandate and related obligations — Art. 6(1)(b) GDPR;",
          "tax, accounting and anti-money-laundering obligations — Art. 6(1)(c) GDPR;",
          "sending the newsletter and off-market property alerts — Art. 6(1)(a) GDPR (consent, revocable at any time);",
          "analytics and marketing cookies — Art. 6(1)(a) GDPR (consent collected via the banner);",
          "website security and prevention of automated form submissions — Art. 6(1)(f) GDPR (legitimate interest in keeping the service available and usable);",
          "legal defence and protection of claims — Art. 6(1)(f) GDPR (legitimate interest of the controller).",
        ],
      },
      {
        id: "conferimento",
        title: "4. Nature of the provision of data",
        paragraphs: [
          "Providing the data marked as mandatory in the forms is necessary to follow up on your request: without it we cannot reply or perform the mandate. Providing data for marketing purposes is optional and refusal does not affect the other services.",
        ],
      },
      {
        id: "destinatari",
        title: "5. Recipients and categories of recipients",
        paragraphs: [
          "Data may be disclosed to parties acting as processors under Art. 28 GDPR or as independent controllers:",
        ],
        bullets: [
          "IT, hosting, email and website maintenance providers;",
          "appointed professionals (notaries, surveyors, lawyers, accountants, valuers) to the extent needed to conclude the transaction;",
          "banks and financial intermediaries, at the data subject's request;",
          "public authorities in the cases provided for by law.",
          "Data is never disseminated or sold to third parties.",
        ],
      },
      {
        id: "trasferimenti",
        title: "6. Transfers outside the EU",
        paragraphs: [
          "Data is stored on servers located within the European Economic Area. Should a supplier involve a transfer to third countries, this will occur only under an adequacy decision of the European Commission or standard contractual clauses pursuant to Art. 46 GDPR, with any supplementary measures required.",
        ],
      },
      {
        id: "conservazione",
        title: "7. Retention period",
        paragraphs: [
          "Contact data collected to answer an enquiry is kept for 24 months from the last meaningful contact. Data relating to completed mandates is kept for 10 years for tax and civil law purposes; anti-money-laundering documentation for 10 years under Legislative Decree 231/2007. Data processed on the basis of consent is kept until that consent is withdrawn.",
        ],
      },
      {
        id: "diritti",
        title: "8. Rights of the data subject",
        paragraphs: ["You may exercise the rights set out in Articles 15–22 GDPR at any time:"],
        bullets: [
          "access to your data and to information about the processing;",
          "rectification of inaccurate data and completion of incomplete data;",
          "erasure (right to be forgotten) in the cases set out in Article 17;",
          "restriction of processing and objection to processing based on legitimate interest;",
          "portability of the data you provided, in a structured, machine-readable format;",
          "withdrawal of consent at any time, without affecting the lawfulness of prior processing.",
          `Requests should be sent to ${COMPANY.pec} and are answered within 30 days.`,
        ],
      },
      {
        id: "reclamo",
        title: "9. Complaint to the supervisory authority",
        paragraphs: [
          "If you believe the processing is unlawful you may lodge a complaint with the Italian Data Protection Authority (Garante per la protezione dei dati personali, Piazza Venezia 11, 00187 Rome — www.garanteprivacy.it) or seek judicial remedy.",
        ],
      },
      {
        id: "modifiche",
        title: "10. Changes to this notice",
        paragraphs: [
          "This notice may be updated to reflect regulatory changes or changes to the services offered. The version in force is always published on this page together with the date of the latest update.",
        ],
      },
    ],
  },
};

/* ------------------------------------------------------------------ *
 * COOKIE POLICY
 * ------------------------------------------------------------------ */
const COOKIE: Record<Locale, LegalDocument> = {
  it: {
    title: "Cookie Policy",
    intro:
      "Questa pagina descrive i cookie e le tecnologie analoghe utilizzati dal sito, ai sensi delle Linee guida del Garante privacy del 10 giugno 2021 e dell'art. 122 del Codice privacy.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        id: "cosa-sono",
        title: "1. Cosa sono i cookie",
        paragraphs: [
          "I cookie sono piccoli file di testo che i siti visitati inviano al terminale dell'utente, dove vengono memorizzati e ritrasmessi agli stessi siti alla visita successiva. Tecnologie analoghe (localStorage, sessionStorage) svolgono funzioni simili e sono qui equiparate ai cookie.",
        ],
      },
      {
        id: "tecnici",
        title: "2. Cookie tecnici e strumenti necessari",
        paragraphs: [
          "Vengono installati senza consenso perché indispensabili al funzionamento del sito. Su questo sito comprendono:",
        ],
        bullets: [
          "`ianes.consent.v1` (localStorage) — memorizza le scelte espresse sul banner cookie. Durata: fino a revoca o pulizia del browser.",
          "`ianes.locale` (cookie e localStorage) — memorizza la lingua scelta per servire la versione corretta del sito. Durata: 12 mesi.",
          "cookie di sessione dell'area riservata, impostati dal fornitore di autenticazione per mantenere l'accesso dello staff. Non vengono impostati durante la normale consultazione del sito.",
        ],
      },
      {
        id: "preferenze",
        title: "3. Cookie di preferenza",
        paragraphs: [
          "Memorizzano impostazioni scelte dall'utente — per esempio ricerche o immobili da ritrovare alla visita successiva — per non doverle reinserire a ogni accesso. Alla data di pubblicazione di questa policy il sito non installa cookie di preferenza: la categoria è predisposta per un'eventuale attivazione futura, che resterà comunque subordinata al consenso e revocabile in qualsiasi momento dal pannello delle preferenze. La lingua scelta non rientra in questa categoria: è memorizzata da un cookie tecnico, descritto al punto 2.",
        ],
      },
      {
        id: "statistici",
        title: "4. Cookie statistici",
        paragraphs: [
          "Consentono di misurare il traffico e capire quali pagine sono più consultate. Vengono attivati solo dopo il consenso e, ove tecnicamente possibile, con IP anonimizzato. Alla data di pubblicazione di questa policy il sito non installa cookie statistici di terze parti: la categoria è predisposta per un'eventuale attivazione futura, che sarà comunque subordinata al consenso.",
        ],
      },
      {
        id: "marketing",
        title: "5. Cookie di marketing e profilazione",
        paragraphs: [
          "Permettono di mostrare annunci pertinenti su piattaforme partner e di misurarne l'efficacia. Sono disattivati per impostazione predefinita e vengono installati solo con consenso esplicito. Anche in questo caso, alla data odierna nessun cookie di marketing di terze parti è attivo sul sito.",
        ],
      },
      {
        id: "gestione",
        title: "6. Come gestire il consenso",
        paragraphs: [
          "Al primo accesso viene mostrato un banner che consente di accettare tutti i cookie, rifiutarli o selezionarli per categoria: le opzioni hanno pari evidenza grafica e nessun cookie non necessario viene installato prima della scelta. Le preferenze possono essere modificate in ogni momento tramite il link «Preferenze cookie» presente nel footer.",
          "In alternativa è possibile gestire o eliminare i cookie dalle impostazioni del browser (Chrome, Firefox, Safari, Edge). La disattivazione dei cookie tecnici può compromettere alcune funzionalità del sito.",
        ],
      },
      {
        id: "titolare-cookie",
        title: "7. Titolare e contatti",
        paragraphs: [
          `Titolare del trattamento: ${IDENTITY.it}. Per esercitare i diritti previsti dagli artt. 15-22 GDPR è possibile scrivere alla PEC ${COMPANY.pec}.`,
        ],
      },
    ],
  },

  de: {
    title: "Cookie-Richtlinie",
    intro:
      "Diese Seite beschreibt die von der Website verwendeten Cookies und vergleichbaren Technologien gemäß den Leitlinien der italienischen Datenschutzbehörde vom 10. Juni 2021 und Art. 122 des italienischen Datenschutzkodex.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        id: "cosa-sono",
        title: "1. Was Cookies sind",
        paragraphs: [
          "Cookies sind kleine Textdateien, die besuchte Websites auf dem Endgerät speichern und beim nächsten Besuch wieder abrufen. Vergleichbare Technologien (localStorage, sessionStorage) erfüllen ähnliche Funktionen und werden hier Cookies gleichgestellt.",
        ],
      },
      {
        id: "tecnici",
        title: "2. Technisch notwendige Cookies",
        paragraphs: [
          "Sie werden ohne Einwilligung gesetzt, da sie für den Betrieb der Website unerlässlich sind. Auf dieser Website sind das:",
        ],
        bullets: [
          "`ianes.consent.v1` (localStorage) — speichert die im Cookie-Banner getroffenen Entscheidungen. Dauer: bis zum Widerruf oder zur Browser-Bereinigung.",
          "`ianes.locale` (Cookie und localStorage) — speichert die gewählte Sprache, um die richtige Fassung auszuliefern. Dauer: 12 Monate.",
          "Sitzungscookies des geschützten Bereichs, die der Authentifizierungsdienst setzt, um die Anmeldung der Mitarbeitenden aufrechtzuerhalten. Beim gewöhnlichen Besuch der Website werden sie nicht gesetzt.",
        ],
      },
      {
        id: "preferenze",
        title: "3. Präferenz-Cookies",
        paragraphs: [
          "Sie speichern gewählte Einstellungen — etwa Suchen oder Objekte, die beim nächsten Besuch wiedergefunden werden sollen —, damit sie nicht erneut eingegeben werden müssen. Zum Zeitpunkt der Veröffentlichung dieser Richtlinie setzt die Website keine Präferenz-Cookies: Die Kategorie ist für eine spätere Aktivierung vorbereitet, die einwilligungsabhängig bleibt und jederzeit über die Einstellungen widerrufen werden kann. Die gewählte Sprache fällt nicht in diese Kategorie: Sie wird von einem technisch notwendigen Cookie gespeichert, das unter Punkt 2 beschrieben ist.",
        ],
      },
      {
        id: "statistici",
        title: "4. Statistik-Cookies",
        paragraphs: [
          "Sie messen den Datenverkehr und zeigen, welche Seiten am häufigsten aufgerufen werden. Sie werden erst nach Einwilligung aktiviert und, soweit technisch möglich, mit anonymisierter IP betrieben. Zum Zeitpunkt der Veröffentlichung setzt die Website keine Statistik-Cookies Dritter; die Kategorie ist für eine spätere, jedenfalls einwilligungsabhängige Aktivierung vorbereitet.",
        ],
      },
      {
        id: "marketing",
        title: "5. Marketing- und Profiling-Cookies",
        paragraphs: [
          "Sie ermöglichen relevante Anzeigen auf Partnerplattformen und deren Erfolgsmessung. Sie sind standardmäßig deaktiviert und werden nur mit ausdrücklicher Einwilligung gesetzt. Auch hier sind derzeit keine Marketing-Cookies Dritter aktiv.",
        ],
      },
      {
        id: "gestione",
        title: "6. Verwaltung der Einwilligung",
        paragraphs: [
          "Beim ersten Zugriff erscheint ein Banner, über das alle Cookies angenommen, abgelehnt oder nach Kategorien ausgewählt werden können: Die Optionen sind grafisch gleichwertig und vor der Entscheidung wird kein nicht notwendiges Cookie gesetzt. Die Einstellungen lassen sich jederzeit über den Link «Cookie-Einstellungen» im Footer ändern.",
          "Alternativ können Cookies über die Browsereinstellungen (Chrome, Firefox, Safari, Edge) verwaltet oder gelöscht werden. Das Deaktivieren technischer Cookies kann Funktionen der Website beeinträchtigen.",
        ],
      },
      {
        id: "titolare-cookie",
        title: "7. Verantwortlicher und Kontakt",
        paragraphs: [
          `Verantwortlicher: ${IDENTITY.de}. Zur Ausübung der Rechte nach Art. 15–22 DSGVO schreiben Sie an die PEC-Adresse ${COMPANY.pec}.`,
        ],
      },
    ],
  },

  en: {
    title: "Cookie Policy",
    intro:
      "This page describes the cookies and similar technologies used by the website, pursuant to the Italian Data Protection Authority's guidelines of 10 June 2021 and Article 122 of the Italian Privacy Code.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        id: "cosa-sono",
        title: "1. What cookies are",
        paragraphs: [
          "Cookies are small text files that the websites you visit send to your device, where they are stored and sent back to those sites on your next visit. Similar technologies (localStorage, sessionStorage) perform comparable functions and are treated here as cookies.",
        ],
      },
      {
        id: "tecnici",
        title: "2. Strictly necessary cookies",
        paragraphs: [
          "These are set without consent because they are essential for the website to work. On this site they are:",
        ],
        bullets: [
          "`ianes.consent.v1` (localStorage) — stores the choices made in the cookie banner. Duration: until withdrawal or browser clean-up.",
          "`ianes.locale` (cookie and localStorage) — stores the chosen language so the correct version is served. Duration: 12 months.",
          "session cookies for the restricted area, set by the authentication provider to keep staff signed in. They are not set during ordinary browsing of the website.",
        ],
      },
      {
        id: "preferenze",
        title: "3. Preference cookies",
        paragraphs: [
          "They store settings you choose — for example searches or properties to find again on your next visit — so you do not have to enter them each time. As at the date of this policy the site sets no preference cookies: the category is prepared for possible future activation, which will remain subject to consent and can be withdrawn at any time from the preferences panel. Your chosen language does not fall into this category: it is stored by a strictly necessary cookie, described in section 2.",
        ],
      },
      {
        id: "statistici",
        title: "4. Statistics cookies",
        paragraphs: [
          "They measure traffic and show which pages are most consulted. They are activated only after consent and, where technically possible, with anonymised IP. As at the date of this policy the site sets no third-party statistics cookies: the category is prepared for possible future activation, which will in any case be subject to consent.",
        ],
      },
      {
        id: "marketing",
        title: "5. Marketing and profiling cookies",
        paragraphs: [
          "They allow relevant advertising to be shown on partner platforms and its effectiveness to be measured. They are disabled by default and are set only with explicit consent. Here too, no third-party marketing cookies are currently active on the site.",
        ],
      },
      {
        id: "gestione",
        title: "6. Managing your consent",
        paragraphs: [
          "On your first visit a banner lets you accept all cookies, reject them or select them by category: the options carry equal visual weight and no non-essential cookie is set before you choose. Preferences can be changed at any time via the “Cookie preferences” link in the footer.",
          "Alternatively you can manage or delete cookies from your browser settings (Chrome, Firefox, Safari, Edge). Disabling technical cookies may impair some site features.",
        ],
      },
      {
        id: "titolare-cookie",
        title: "7. Controller and contacts",
        paragraphs: [
          `Data controller: ${IDENTITY.en}. To exercise the rights under Articles 15–22 GDPR you may write to ${COMPANY.pec}.`,
        ],
      },
    ],
  },
};

/* ------------------------------------------------------------------ *
 * TERMINI E CONDIZIONI
 * ------------------------------------------------------------------ */
const TERMS: Record<Locale, LegalDocument> = {
  it: {
    title: "Termini e condizioni di utilizzo",
    intro:
      "Le presenti condizioni disciplinano l'accesso e l'uso del sito e descrivono i principi dell'attività di mediazione immobiliare svolta da IMMOBIL IANES S.R.L. ai sensi della Legge 39/1989.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        id: "titolare-sito",
        title: "1. Titolare del sito",
        paragraphs: [`Il sito è gestito da ${IDENTITY.it}.`],
      },
      {
        id: "oggetto",
        title: "2. Oggetto e accettazione",
        paragraphs: [
          "L'accesso al sito e l'utilizzo dei suoi servizi comportano l'accettazione integrale delle presenti condizioni. Chi non intenda accettarle è invitato a non utilizzare il sito.",
        ],
      },
      {
        id: "annunci",
        title: "3. Natura delle informazioni pubblicate",
        paragraphs: [
          "Le schede immobiliari, le immagini, le planimetrie e i dati tecnici hanno finalità meramente illustrativa e non costituiscono offerta al pubblico ai sensi dell'art. 1336 c.c. né proposta contrattuale.",
          "I dati metrici, catastali, urbanistici ed energetici sono forniti dalla proprietà e verificati con la documentazione disponibile: possono subire variazioni e devono essere confermati in sede di due diligence e di atto notarile. La disponibilità e il prezzo degli immobili possono cambiare senza preavviso.",
        ],
      },
      {
        id: "mediazione",
        title: "4. Attività di mediazione",
        paragraphs: [
          "L'attività di mediazione è svolta in conformità alla Legge 39/1989 e successive modifiche, previa iscrizione al Registro delle Imprese di Trento (REA " +
            COMPANY.rea +
            ").",
          "La provvigione è dovuta, ai sensi dell'art. 1755 c.c., al momento della conclusione dell'affare, secondo la misura e le modalità concordate per iscritto nell'incarico o nella proposta d'acquisto. Nessun compenso è dovuto per la sola consultazione del sito o per la richiesta di informazioni.",
        ],
      },
      {
        id: "uso",
        title: "5. Uso consentito del sito",
        paragraphs: [
          "È vietato l'utilizzo di sistemi automatizzati di raccolta dati (scraping), la riproduzione sistematica delle schede immobiliari, l'invio di comunicazioni indesiderate ai contatti pubblicati e qualsiasi condotta che possa comprometterne la sicurezza o la disponibilità.",
        ],
      },
      {
        id: "proprieta-intellettuale",
        title: "6. Proprietà intellettuale",
        paragraphs: [
          "Marchi, logo, testi, fotografie, planimetrie, layout e codice sorgente sono di titolarità di IMMOBIL IANES S.R.L. o dei rispettivi autori e sono protetti dalla Legge 633/1941. Ogni riproduzione, anche parziale, è vietata senza autorizzazione scritta.",
        ],
      },
      {
        id: "responsabilita",
        title: "7. Limitazione di responsabilità",
        paragraphs: [
          "Il titolare adotta ogni ragionevole cura affinché i contenuti siano aggiornati e accurati, ma non garantisce l'assenza di errori né la continuità del servizio. È esclusa ogni responsabilità per danni derivanti dall'uso o dall'impossibilità di uso del sito, salvi i casi di dolo o colpa grave.",
        ],
      },
      {
        id: "link",
        title: "8. Collegamenti a siti terzi",
        paragraphs: [
          "Il sito può contenere collegamenti a risorse esterne. Il titolare non esercita alcun controllo su tali risorse e non risponde dei loro contenuti né delle rispettive politiche in materia di dati personali.",
        ],
      },
      {
        id: "legge",
        title: "9. Legge applicabile e foro competente",
        paragraphs: [
          "Le presenti condizioni sono regolate dalla legge italiana. Per ogni controversia è competente in via esclusiva il Foro di Trento, salva la competenza inderogabile del foro del consumatore ai sensi dell'art. 66-bis del Codice del consumo.",
          "Il consumatore può inoltre rivolgersi agli organismi di mediazione iscritti nel registro tenuto dal Ministero della Giustizia ai sensi del D.lgs. 28/2010, o agli organismi ADR iscritti negli elenchi previsti dal Codice del consumo.",
        ],
      },
      {
        id: "modifiche-termini",
        title: "10. Modifiche",
        paragraphs: [
          "Il titolare si riserva di modificare le presenti condizioni in qualsiasi momento. Le modifiche hanno effetto dalla pubblicazione su questa pagina.",
        ],
      },
    ],
  },

  de: {
    title: "Allgemeine Nutzungsbedingungen",
    intro:
      "Diese Bedingungen regeln den Zugang zur Website und deren Nutzung und beschreiben die Grundsätze der von IMMOBIL IANES S.R.L. gemäß Gesetz 39/1989 ausgeübten Immobilienvermittlung.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        id: "titolare-sito",
        title: "1. Betreiber der Website",
        paragraphs: [`Die Website wird betrieben von ${IDENTITY.de}.`],
      },
      {
        id: "oggetto",
        title: "2. Gegenstand und Annahme",
        paragraphs: [
          "Der Zugriff auf die Website und die Nutzung ihrer Dienste bedeuten die vollständige Annahme dieser Bedingungen. Wer sie nicht annehmen möchte, wird gebeten, die Website nicht zu nutzen.",
        ],
      },
      {
        id: "annunci",
        title: "3. Charakter der veröffentlichten Informationen",
        paragraphs: [
          "Objektbeschreibungen, Bilder, Grundrisse und technische Daten dienen ausschließlich der Veranschaulichung und stellen weder ein öffentliches Angebot im Sinne von Art. 1336 ital. ZGB noch einen Vertragsantrag dar.",
          "Flächen-, Kataster-, bau- und energierechtliche Daten stammen von der Eigentümerseite und wurden anhand der verfügbaren Unterlagen geprüft: Sie können sich ändern und sind im Rahmen der Due Diligence und beim Notartermin zu bestätigen. Verfügbarkeit und Preis können sich ohne Vorankündigung ändern.",
        ],
      },
      {
        id: "mediazione",
        title: "4. Vermittlungstätigkeit",
        paragraphs: [
          `Die Vermittlung erfolgt gemäß Gesetz 39/1989 in geltender Fassung, nach Eintragung im Handelsregister Trient (REA ${COMPANY.rea}).`,
          "Die Provision ist gemäß Art. 1755 ital. ZGB mit Abschluss des Geschäfts fällig, in der im Auftrag oder im Kaufangebot schriftlich vereinbarten Höhe und Form. Für die bloße Nutzung der Website oder eine Informationsanfrage fällt kein Entgelt an.",
        ],
      },
      {
        id: "uso",
        title: "5. Zulässige Nutzung",
        paragraphs: [
          "Untersagt sind automatisierte Datenerhebung (Scraping), die systematische Vervielfältigung der Objektbeschreibungen, unerwünschte Zusendungen an die veröffentlichten Kontakte sowie jedes Verhalten, das Sicherheit oder Verfügbarkeit der Website beeinträchtigen kann.",
        ],
      },
      {
        id: "proprieta-intellettuale",
        title: "6. Geistiges Eigentum",
        paragraphs: [
          "Marken, Logo, Texte, Fotografien, Grundrisse, Layout und Quellcode stehen im Eigentum der IMMOBIL IANES S.R.L. bzw. der jeweiligen Urheber und sind durch Gesetz 633/1941 geschützt. Jede auch teilweise Vervielfältigung ohne schriftliche Genehmigung ist untersagt.",
        ],
      },
      {
        id: "responsabilita",
        title: "7. Haftungsbeschränkung",
        paragraphs: [
          "Der Betreiber wendet jede zumutbare Sorgfalt auf, damit die Inhalte aktuell und richtig sind, garantiert jedoch weder Fehlerfreiheit noch ununterbrochene Verfügbarkeit. Eine Haftung für Schäden aus der Nutzung oder Nichtnutzbarkeit der Website ist ausgeschlossen, ausgenommen Vorsatz und grobe Fahrlässigkeit.",
        ],
      },
      {
        id: "link",
        title: "8. Links zu Websites Dritter",
        paragraphs: [
          "Die Website kann Verweise auf externe Ressourcen enthalten. Der Betreiber hat darauf keinen Einfluss und haftet weder für deren Inhalte noch für deren Datenschutzpraktiken.",
        ],
      },
      {
        id: "legge",
        title: "9. Anwendbares Recht und Gerichtsstand",
        paragraphs: [
          "Es gilt italienisches Recht. Ausschließlicher Gerichtsstand ist Trient, unbeschadet des zwingenden Verbrauchergerichtsstands gemäß Art. 66-bis des ital. Verbraucherkodex.",
          "Verbraucher können sich zudem an die im Register des italienischen Justizministeriums eingetragenen Mediationsstellen gemäß GvD 28/2010 oder an die in den Verzeichnissen des ital. Verbraucherkodex geführten AS-Stellen wenden.",
        ],
      },
      {
        id: "modifiche-termini",
        title: "10. Änderungen",
        paragraphs: [
          "Der Betreiber behält sich vor, diese Bedingungen jederzeit zu ändern. Änderungen werden mit ihrer Veröffentlichung auf dieser Seite wirksam.",
        ],
      },
    ],
  },

  en: {
    title: "Terms and conditions of use",
    intro:
      "These terms govern access to and use of the website and describe the principles of the real estate brokerage carried out by IMMOBIL IANES S.R.L. under Italian Law 39/1989.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        id: "titolare-sito",
        title: "1. Website owner",
        paragraphs: [`The website is operated by ${IDENTITY.en}.`],
      },
      {
        id: "oggetto",
        title: "2. Subject matter and acceptance",
        paragraphs: [
          "Accessing the website and using its services implies full acceptance of these terms. If you do not wish to accept them, please do not use the website.",
        ],
      },
      {
        id: "annunci",
        title: "3. Nature of the information published",
        paragraphs: [
          "Property descriptions, images, floor plans and technical data are illustrative only and constitute neither a public offer under Article 1336 of the Italian Civil Code nor a contractual proposal.",
          "Metric, cadastral, planning and energy data are supplied by the owner and checked against available documentation: they may change and must be confirmed during due diligence and at the notarial deed. Availability and prices may change without notice.",
        ],
      },
      {
        id: "mediazione",
        title: "4. Brokerage activity",
        paragraphs: [
          `Brokerage is carried out in accordance with Italian Law 39/1989 as amended, following registration with the Trento Company Register (REA ${COMPANY.rea}).`,
          "Under Article 1755 of the Italian Civil Code the commission falls due when the deal is concluded, in the amount and on the terms agreed in writing in the mandate or purchase offer. No fee is due merely for consulting the website or requesting information.",
        ],
      },
      {
        id: "uso",
        title: "5. Permitted use",
        paragraphs: [
          "Automated data collection (scraping), systematic reproduction of property listings, sending unsolicited communications to the published contacts and any conduct that may compromise the security or availability of the site are prohibited.",
        ],
      },
      {
        id: "proprieta-intellettuale",
        title: "6. Intellectual property",
        paragraphs: [
          "Trade marks, logo, texts, photographs, floor plans, layout and source code belong to IMMOBIL IANES S.R.L. or to their respective authors and are protected by Italian Law 633/1941. Any reproduction, even partial, is prohibited without written authorisation.",
        ],
      },
      {
        id: "responsabilita",
        title: "7. Limitation of liability",
        paragraphs: [
          "The owner takes all reasonable care to keep the content up to date and accurate but does not warrant that it is error-free or that the service will be uninterrupted. Liability for damages arising from use or inability to use the website is excluded, save in cases of wilful misconduct or gross negligence.",
        ],
      },
      {
        id: "link",
        title: "8. Links to third-party sites",
        paragraphs: [
          "The website may contain links to external resources. The owner exercises no control over them and is not responsible for their content or their personal data policies.",
        ],
      },
      {
        id: "legge",
        title: "9. Governing law and jurisdiction",
        paragraphs: [
          "These terms are governed by Italian law. The Court of Trento has exclusive jurisdiction over any dispute, without prejudice to the mandatory consumer jurisdiction under Article 66-bis of the Italian Consumer Code.",
          "Consumers may also turn to the mediation bodies entered in the register kept by the Italian Ministry of Justice under Legislative Decree 28/2010, or to the ADR entities listed under the Italian Consumer Code.",
        ],
      },
      {
        id: "modifiche-termini",
        title: "10. Amendments",
        paragraphs: [
          "The owner reserves the right to amend these terms at any time. Amendments take effect once published on this page.",
        ],
      },
    ],
  },
};

export const LEGAL_DOCUMENTS = {
  privacy: PRIVACY,
  cookie: COOKIE,
  terms: TERMS,
} as const;

export type LegalDocumentKey = keyof typeof LEGAL_DOCUMENTS;

export function getLegalDocument(key: LegalDocumentKey, locale: Locale): LegalDocument {
  return LEGAL_DOCUMENTS[key][locale];
}
