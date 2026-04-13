/**
 * translations.js
 *
 * Central English → German dictionary for the entire frontend.
 * Usage: import { t } from "../lib/translations";
 *        Then wrap any UI string: {t("Book now")} → "Jetzt buchen"
 *
 * t() is called at render time, so every string is translated
 * automatically as soon as the site loads.
 */

const dictionary = {
  // ── Navigation ────────────────────────────────────────────────────────────
  Home: "Startseite",
  Services: "Leistungen",
  Pricing: "Preise",
  Preparation: "Vorbereitung",
  "How it works": "So funktioniert es",
  "How it Works": "So funktioniert es",
  "Book pickup": "Abholung buchen",
  "Book now": "Jetzt buchen",
  "Start booking": "Jetzt buchen",
  "Back home": "Zurück zur Startseite",
  "Back to home": "Zurück zur Startseite",
  Admin: "Admin",
  "Sign out": "Abmelden",
  "Toggle menu": "Menü umschalten",

  // ── Hero / Home ───────────────────────────────────────────────────────────
  "We pick up your laundry.": "Wir holen Ihre Wäsche ab.",
  "your laundry.": "Ihre Wäsche.",
  "We pick up": "Wir holen ab",
  "Clean. Ironed. Folded back.": "Sauber. Gebügelt. Ordentlich gefaltet.",
  "Back clean in 48h — no effort for you.":
    "In 48h zurück – kein Aufwand für Sie.",
  "Order once — everything runs automatically.":
    "Einmal bestellen – alles läuft automatisch.",
  "A warmer, simpler laundry experience for the web. Register once, use your QR-linked bag, and schedule pickups in a few clear steps.":
    "Ein persönlicheres, einfacheres Wäscheerlebnis im Web. Einmal registrieren, QR-verknüpften Beutel verwenden und Abholungen in wenigen klaren Schritten planen.",
  "Returned within 48 hours with monthly billing in CHF and no online checkout at pickup time.":
    "Zurückgegeben innerhalb von 48 Stunden mit monatlicher Abrechnung in CHF und ohne Online-Kasse bei der Abholung.",
  "Everyday laundry": "Alltagswäsche",
  "Designed for repeat use, not one-off friction.":
    "Für den regelmäßigen Gebrauch konzipiert, nicht für einmaligen Aufwand.",
  "Start your booking": "Jetzt buchen",
  "View the full process": "Den gesamten Prozess ansehen",
  "Ready for less laundry effort?":
    "Bereit für weniger Aufwand bei der Wäsche?",
  "Keep the homepage simple and go straight into a separate booking flow when you are ready.":
    "Halten Sie die Startseite einfach und gehen Sie direkt in einen separaten Buchungsablauf, wenn Sie bereit sind.",

  // ── Service items ─────────────────────────────────────────────────────────
  Washing: "Waschen",
  Drying: "Trocknen",
  Ironing: "Bügeln",
  Folding: "Falten",
  Wash: "Waschen",
  "Dry & Iron": "Trocknen & Bügeln",
  Fold: "Falten",

  // ── Pricing ───────────────────────────────────────────────────────────────
  "Pricing & billing": "Preise & Abrechnung",
  "Prices & Billing": "Preise & Abrechnung",
  "Simple. Transparent. Convenient.": "Einfach. Transparent. Bequem.",
  "Clear pricing per bag, no complicated tariffs, and one monthly invoice by email.":
    "Klare Preise pro Beutel, keine komplizierten Tarife und eine monatliche Rechnung per E-Mail.",
  "Clear prices per bag – no complicated rates or online payment.":
    "Klare Preise pro Beutel – keine komplizierten Tarife oder Online-Zahlung.",
  "One-time order": "Einzelbestellung",
  "Single order": "Einzelbestellung",
  "per laundry bag": "pro Wäschebeutel",
  "per Laundry Bag": "pro Wäschebeutel",
  "Approx. 5 to 6 kg of everyday laundry. Washing, drying, ironing, and folding included.":
    "Ca. 5–6 kg Alltagswäsche. Waschen, Trocknen, Bügeln und Falten inklusive.",
  "Washing, Drying, Ironing and Folding included":
    "Waschen, Trocknen, Bügeln und Falten inklusive",
  Subscription: "Abonnement",
  "per bag": "pro Beutel",
  "per Bag": "pro Beutel",
  "Best for fixed weekly pickups with the same premium wash, dry, iron, and fold flow.":
    "Am besten für feste wöchentliche Abholungen mit demselben erstklassigen Wasch-, Trocknungs-, Bügel- und Faltprozess.",
  "More convenience at a better price": "Mehr Komfort zu einem besseren Preis",
  "with fixed weekly pickup": "mit fester wöchentlicher Abholung",
  "approx.5–6 kg everyday": "ca. 5–6 kg Alltagswäsche",
  "approx. 5–6 kg everyday": "ca. 5–6 kg Alltagswäsche",
  Popular: "Beliebt",
  "Shirts & blouses": "Hemden & Blusen",
  "Shirts & Blouses": "Hemden & Blusen",
  "billed separately": "separat abgerechnet",
  "+ CHF 4 / piece": "+ CHF 4 / Stück",
  "End of month instead of checkout stress": "Monatsende statt Kassenstress",
  "All orders are collected and you conveniently receive one invoice by email.":
    "Alle Bestellungen werden gesammelt und Sie erhalten bequem eine Rechnung per E-Mail.",
  "No online payment needed": "Keine Online-Zahlung erforderlich",
  "Conveniently collected": "Bequem gesammelt",
  "Transparent billing": "Transparente Abrechnung",

  // ── Services page ─────────────────────────────────────────────────────────
  "Our Service": "Unser Service",
  "Our service": "Unser Service",
  "We take care of the hard part": "Wir kümmern uns um den schwierigen Teil",
  "We handle the part that takes time.":
    "Wir übernehmen den zeitaufwändigen Teil.",
  "Service quality, bag-based convenience, and clear reasons to book — all in one place.":
    "Servicequalität, Beutelkomfort und klare Buchungsgründe – alles an einem Ort.",
  "Washing, Drying, Ironing and Folding – so your laundry comes back clean and neat.":
    "Waschen, Trocknen, Bügeln und Falten – damit Ihre Wäsche sauber und ordentlich zurückkommt.",
  "Suitable for everyday laundry": "Geeignet für Alltagswäsche",
  Shirts: "Hemden",
  Pants: "Hosen",
  Underwear: "Unterwäsche",
  Sportswear: "Sportkleidung",
  Towels: "Handtücher",
  Trousers: "Hosen",
  "Deep cleaning for your daily clothes. We sort by color and fabric type to ensure perfect results.":
    "Tiefenreinigung Ihrer Alltagskleidung. Wir sortieren nach Farbe und Gewebetyp für perfekte Ergebnisse.",
  "Gentle drying, ready for the day. Temperature-controlled cycles protect your garments from shrinking.":
    "Sanftes Trocknen, bereit für den Tag. Temperaturgesteuerte Zyklen schützen Ihre Kleidung vor dem Einlaufen.",
  "Perfectly pressed for a professional look. Hand-finished detailing for crisp collars and cuffs.":
    "Perfekt gebügelt für ein professionelles Erscheinungsbild. Handverarbeitete Details für knackige Kragen und Manschetten.",
  "Neatly folded and ready to be put away. Marie Kondo-style folding available upon request.":
    "Ordentlich gefaltet und bereit zum Einräumen. Marie-Kondo-Falttechnik auf Anfrage verfügbar.",
  "Thorough cleaning of your everyday clothes.":
    "Gründliche Reinigung Ihrer Alltagskleidung.",
  "Gentle and clean, ready for the day.":
    "Sanft und sauber, bereit für den Tag.",
  "Neatly pressed for a well-kept result.":
    "Ordentlich gebügelt für ein gepflegtes Ergebnis.",
  "Neatly laid out and ready to put away.":
    "Ordentlich zusammengelegt und bereit zum Einräumen.",

  // ── Preparation ───────────────────────────────────────────────────────────
  "Preparation & Guidelines": "Vorbereitung & Richtlinien",
  "Simply prepare – we handle the rest":
    "Einfach vorbereiten – wir erledigen den Rest",
  "Prepare it simply. We handle the rest.":
    "Einfach vorbereiten – wir erledigen den Rest.",
  "The detailed process is now on its own page, while the homepage keeps only the most important preparation guidance.":
    "Der detaillierte Prozess ist jetzt auf einer eigenen Seite, während die Startseite nur die wichtigsten Vorbereitungshinweise enthält.",
  "With a few simple rules we make sure your laundry comes back perfectly.":
    "Mit ein paar einfachen Regeln stellen wir sicher, dass Ihre Wäsche perfekt zurückkommt.",
  "Prepare your laundry": "Wäsche vorbereiten",
  "Prepare Your Laundry": "Wäsche vorbereiten",
  "Sort light, dark and coloured separately":
    "Hell, dunkel und bunt getrennt sortieren",
  "Normal everyday laundry only": "Nur normale Alltagswäsche",
  "Do not overfill the bag": "Den Beutel nicht überfüllen",
  "Important to know": "Wichtig zu wissen",
  "What You Should Know": "Was Sie wissen sollten",
  "We wash as handed in": "Wir waschen wie abgegeben",
  "No sorting of individual items":
    "Keine Sortierung einzelner Kleidungsstücke",
  "Mixed laundry is washed together":
    "Gemischte Wäsche wird zusammen gewaschen",
  "No liability for valuables left in pockets":
    "Keine Haftung für Wertgegenstände in Taschen",
  "Report special care instructions beforehand":
    "Besondere Pflegehinweise vorher mitteilen",
  "Check clothing labels for washability": "Etiketten auf Waschbarkeit prüfen",
  "Not suitable": "Nicht geeignet",
  "Not Accepted": "Nicht akzeptiert",
  "Silk, wool, leather": "Seide, Wolle, Leder",
  "Duvets, pillows, curtains": "Duvets, Kissen, Vorhänge",
  "Heavily soiled clothing": "Stark verschmutzte Kleidung",
  "Silk, wool, leather garments": "Kleidung aus Seide, Wolle, Leder",
  "Curtains, carpets, large bedding": "Vorhänge, Teppiche, große Bettwäsche",
  "Heavily stained or damaged items":
    "Stark verschmutzte oder beschädigte Kleidungsstücke",
  "Not sorted, but pre-washed if needed":
    "Unvorsortiert, aber bei Bedarf vorgewaschen",
  "Remove delicate items": "Empfindliche Kleidungsstücke entfernen",
  "Check pockets for loose items": "Taschen auf lose Gegenstände prüfen",
  "If in doubt: just ask us quickly — we are happy to help.":
    "Im Zweifelsfall: Fragen Sie uns einfach – wir helfen gerne.",
  "Ready for less effort?": "Bereit für weniger Aufwand?",
  "Start now and leave your laundry to us.":
    "Starten Sie jetzt und überlassen Sie uns Ihre Wäsche.",
  "View how it works again": "Noch einmal ansehen, wie es funktioniert",

  // ── How it works ──────────────────────────────────────────────────────────
  "Smart Pickup System": "Smartes Abholsystem",
  "Smart pickup": "Smarte Abholung",
  "Scan. Choose a time. Place it by the door.":
    "Scannen. Zeit wählen. An die Tür stellen.",
  "Scan. Choose a time. Leave it by the door.":
    "Scannen. Zeit wählen. An die Tür stellen.",
  "The QR code on your bag makes ordering even easier.":
    "Der QR-Code auf Ihrem Beutel macht das Bestellen noch einfacher.",
  "Scan the QR code": "QR-Code scannen",
  "Scan the code on your laundry bag directly with your phone.":
    "Scannen Sie den Code auf Ihrem Wäschebeutel direkt mit Ihrem Telefon.",
  "Choose a time window": "Zeitfenster wählen",
  "Your address is recognised and you choose an available time slot.":
    "Ihre Adresse wird erkannt und Sie wählen einen verfügbaren Zeitslot.",
  "Place it by the door": "An die Tür stellen",
  "Put your bag outside in the morning for scheduled collection.":
    "Stellen Sie Ihren Beutel morgens für die geplante Abholung nach draußen.",
  "Receive it back clean": "Sauber zurückerhalten",
  "In the evening you get your laundry back clean, ironed and folded.":
    "Am Abend erhalten Sie Ihre Wäsche sauber, gebügelt und gefaltet zurück.",
  "End of month: You conveniently receive a consolidated invoice by email.":
    "Monatsende: Sie erhalten bequem eine konsolidierte Rechnung per E-Mail.",
  "No address re-entry": "Keine erneute Adresseingabe",
  "No address re-entry every time":
    "Keine erneute Adresseingabe bei jeder Bestellung",
  "No online payment at pickup": "Keine Online-Zahlung bei der Abholung",
  "Clear monthly invoicing": "Übersichtliche monatliche Abrechnung",
  "Why customers like this flow": "Warum Kunden diesen Ablauf mögen",
  "Continue to booking": "Weiter zur Buchung",
  "The process is now separate from the homepage so it stays easier to understand. This page explains the simple pickup flow in English.":
    "Der Prozess ist jetzt von der Startseite getrennt, damit er leichter zu verstehen bleibt. Diese Seite erklärt den einfachen Abholablauf.",
  "Scan your bag": "Beutel scannen",
  "Your QR-linked laundry bag identifies your account in seconds.":
    "Ihr QR-verknüpfter Wäschebeutel identifiziert Ihr Konto in Sekunden.",
  "Select the pickup date and slot that fits your routine.":
    "Wählen Sie das Abholdatum und den Zeitslot, der zu Ihrer Routine passt.",
  "Leave the bag outside in the morning for scheduled collection.":
    "Lassen Sie den Beutel morgens für die geplante Abholung draußen stehen.",
  "Your laundry returns washed, finished, and folded within 48 hours.":
    "Ihre Wäsche kommt innerhalb von 48 Stunden gewaschen, fertiggestellt und gefaltet zurück.",
  "Confirm Time Window": "Zeitfenster bestätigen",
  "Tomorrow 08:00 – 10:00": "Morgen 08:00 – 10:00",
  "Musterstraße 12, Berlin": "Musterstraße 12, Berlin",

  // ── Booking flow ──────────────────────────────────────────────────────────
  "Get started": "Loslegen",
  "Start your laundry service": "Ihren Wäscheservice starten",
  "You're all set!": "Alles erledigt!",
  "Register in minutes — no password required. Just your email and a quick verification code.":
    "In wenigen Minuten registrieren – kein Passwort erforderlich. Nur Ihre E-Mail und ein schneller Bestätigungscode.",
  "Enter the 6-digit code we sent to your email.":
    "Geben Sie den 6-stelligen Code ein, den wir an Ihre E-Mail gesendet haben.",
  "Just a few more details so we can deliver to you.":
    "Noch ein paar Details, damit wir Ihnen liefern können.",
  "Your laundry bag is on its way.": "Ihr Wäschebeutel ist unterwegs.",
  Email: "E-Mail",
  Verify: "Bestätigen",
  Details: "Details",
  "Step 1 of 3": "Schritt 1 von 3",
  "Step 2 of 3": "Schritt 2 von 3",
  "Step 3 of 3": "Schritt 3 von 3",
  "Enter your email": "E-Mail eingeben",
  "We'll send a one-time verification code to your inbox. No password needed.":
    "Wir senden einen einmaligen Bestätigungscode an Ihr Postfach. Kein Passwort erforderlich.",
  "Email address": "E-Mail-Adresse",
  "Sending code\u2026": "Code wird gesendet\u2026",
  "Send verification code": "Bestätigungscode senden",
  "Enter your code": "Code eingeben",
  "Verifying\u2026": "Bestätigung läuft\u2026",
  "Verify code": "Code bestätigen",
  "\u2190 Change email": "\u2190 E-Mail ändern",
  "Resend code": "Code erneut senden",
  "Your details": "Ihre Angaben",
  "We need these to deliver your bag and schedule pickups.":
    "Wir benötigen diese Angaben, um Ihren Beutel zu liefern und Abholungen zu planen.",
  "First name *": "Vorname *",
  "Last name *": "Nachname *",
  "Street address *": "Straße und Hausnummer *",
  "Locating\u2026": "Wird ermittelt\u2026",
  "Detect location": "Standort ermitteln",
  "Postal code": "Postleitzahl",
  City: "Stadt",
  "Phone number": "Telefonnummer",
  "Saving\u2026": "Wird gespeichert\u2026",
  "Complete registration": "Registrierung abschließen",
  "You'll receive your bag!": "Sie erhalten Ihren Beutel!",
  "What happens next?": "Was passiert als Nächstes?",
  "How it works": "So funktioniert es",
  "Register with your email. We'll send you a verification code — no password needed.":
    "Registrieren Sie sich mit Ihrer E-Mail. Wir senden Ihnen einen Bestätigungscode – kein Passwort erforderlich.",
  "We ship you a laundry bag with a QR code. Fill it and scan the QR when you're ready.":
    "Wir schicken Ihnen einen Wäschebeutel mit QR-Code. Füllen Sie ihn und scannen Sie den QR, wenn Sie bereit sind.",
  "Scan the QR on your bag, enter your email, and your details are pre-filled. Choose a pickup slot and confirm.":
    "Scannen Sie den QR auf Ihrem Beutel, geben Sie Ihre E-Mail ein und Ihre Daten werden vorausgefüllt. Wählen Sie einen Abholzeitslot und bestätigen Sie.",
  "We wash, fold, and return your laundry within 48 hours.":
    "Wir waschen, falten und geben Ihre Wäsche innerhalb von 48 Stunden zurück.",
  "No passwords.": "Keine Passwörter.",
  "Your identity is always verified via a fresh code straight to your inbox. Fast, secure, and hassle-free.":
    "Ihre Identität wird immer über einen frischen Code direkt in Ihrem Postfach verifiziert. Schnell, sicher und problemlos.",
  "We send you a laundry bag with a QR code attached.":
    "Wir senden Ihnen einen Wäschebeutel mit aufgeklebtem QR-Code.",
  "Fill the bag with your laundry.": "Füllen Sie den Beutel mit Ihrer Wäsche.",
  "Scan the QR code on the bag — enter your email and your details will be pre-filled. Choose your pickup time and confirm.":
    "Scannen Sie den QR-Code auf dem Beutel – geben Sie Ihre E-Mail ein und Ihre Daten werden vorausgefüllt. Wählen Sie Ihre Abholzeit und bestätigen Sie.",
  "Place the bag outside your door. We handle the rest.":
    "Stellen Sie den Beutel vor Ihre Tür. Wir erledigen den Rest.",
  "We've registered your details. Your laundry bag is on its way to you. It will have a QR code attached — scan it when you're ready to schedule your first pickup.":
    "Wir haben Ihre Daten registriert. Ihr Wäschebeutel ist auf dem Weg zu Ihnen. Er hat einen QR-Code – scannen Sie ihn, wenn Sie bereit sind, Ihre erste Abholung zu planen.",

  // ── Laundry types (bag scan) ──────────────────────────────────────────────
  White: "Weiß",
  Dark: "Dunkel",
  Color: "Farbe",
  "Not selected": "Nicht ausgewählt",

  // ── QrCard ────────────────────────────────────────────────────────────────
  "Your bag QR": "Ihr Beutel-QR",
  "Scan this code on your bag for future pickups.":
    "Scannen Sie diesen Code auf Ihrem Beutel für zukünftige Abholungen.",
  "Bag code pending": "Beutelcode ausstehend",

  // ── Footer ────────────────────────────────────────────────────────────────
  "Premium laundry and dry cleaning delivered to your door. Modernizing fabric care for the busy professional.":
    "Erstklassige Wäsche und Reinigung bis an Ihre Haustür. Moderne Textilpflege für den beschäftigten Berufstätigen.",
  "Wash & Fold": "Waschen & Falten",
  "Dry Cleaning": "Chemische Reinigung",
  "Iron & Press": "Bügeln & Pressen",
  "Commercial Laundry": "Gewerbliche Wäsche",
  Company: "Unternehmen",
  "About Us": "Über uns",
  Careers: "Karriere",
  "Stay Updated": "Aktuell bleiben",
  "Subscribe to our newsletter for tips on fabric care and exclusive offers.":
    "Abonnieren Sie unseren Newsletter für Tipps zur Textilpflege und exklusive Angebote.",
  Subscribe: "Abonnieren",
  "© 2026 laundry.li. All rights reserved.":
    "© 2026 laundry.li. Alle Rechte vorbehalten.",
  "Privacy Policy": "Datenschutzerklärung",
  "Terms of Service": "Nutzungsbedingungen",

  // ── Bag scan page ─────────────────────────────────────────────────────────
  "Bag scan": "Beutel scannen",

  // ── Split strings used in JSX ─────────────────────────────────────────────
  "Scan. Choose a time.": "Scannen. Zeit wählen.",
  "Place it by the door.": "An die Tür stellen.",
  "Simply prepare –": "Einfach vorbereiten –",
  "we handle the rest": "wir erledigen den Rest",
  "We sent a 6-digit code to": "Wir haben einen 6-stelligen Code gesendet an",
  "It expires in 10 minutes.": "Er läuft in 10 Minuten ab.",
  "Change email": "E-Mail ändern",
  "We've registered your details. Your laundry bag is on its way. It will have a QR code \u2014 scan it when you're ready to schedule your first pickup.":
    "Wir haben Ihre Daten registriert. Ihr Wäschebeutel ist auf dem Weg zu Ihnen. Er hat einen QR-Code – scannen Sie ihn, wenn Sie bereit sind, Ihre erste Abholung zu planen.",
  "We send you a laundry bag with a QR code.":
    "Wir senden Ihnen einen Wäschebeutel mit QR-Code.",
  "Register with your email. We\u2019ll send you a verification code \u2014 no password needed.":
    "Registrieren Sie sich mit Ihrer E-Mail. Wir senden Ihnen einen Bestätigungscode – kein Passwort erforderlich.",
  "We ship you a laundry bag with a QR code. Fill it and scan the QR when you\u2019re ready.":
    "Wir schicken Ihnen einen Wäschebeutel mit QR-Code. Füllen Sie ihn und scannen Sie den QR, wenn Sie bereit sind.",
  "Scan the QR code on the bag \u2014 enter your email and your details will be pre-filled. Choose your pickup time and confirm.":
    "Scannen Sie den QR-Code auf dem Beutel – geben Sie Ihre E-Mail ein und Ihre Daten werden vorausgefüllt. Wählen Sie Ihre Abholzeit und bestätigen Sie.",
  "We\u2019ll send a one-time verification code to your inbox. No password needed.":
    "Wir senden einen einmaligen Bestätigungscode an Ihr Postfach. Kein Passwort erforderlich.",
  "Register in minutes \u2014 no password required. Just your email and a quick verification code.":
    "In wenigen Minuten registrieren – kein Passwort erforderlich. Nur Ihre E-Mail und ein schneller Bestätigungscode.",
  "Your identity is always verified via a fresh code straight to your inbox. Fast, secure, and hassle-free.":
    "Ihre Identität wird immer über einen frischen Code direkt in Ihrem Postfach verifiziert. Schnell, sicher und problemlos.",
};

/**
 * t(text) — Translate an English string to German.
 * Returns the German translation if found, otherwise returns the original text.
 * Called automatically at render time, so all text is translated on page load.
 */
export function t(text) {
  return dictionary[text] ?? text;
}
