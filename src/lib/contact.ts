// Contact links with prefilled messages.
//
// The message copy is kept as plain readable strings and encoded here with
// encodeURIComponent, rather than pasting pre-encoded blobs into each href.
// That keeps the wording editable and guarantees the encoding is right in one
// place: spaces become %20, and anything that would otherwise break the query
// string (&, ?, #) is escaped.
//
// Every value below is computed once at module load from constants, so it is
// identical on the server and in the browser and cannot cause a hydration
// mismatch.

const WHATSAPP_NUMBER = '919819250202';
const EMAIL_ADDRESS = 'info@breathen99.com';

/** Human-readable number for link text. */
export const CONTACT_PHONE = '+91 98192 50202';

// encodeURIComponent deliberately leaves ! ' ( ) * alone. They are legal in a
// query string, but an apostrophe then reaches the HTML as &#x27; inside the
// href, which makes the raw markup ambiguous to anything reading it before the
// browser decodes entities. Encoding them keeps the attribute pure percent-
// encoding, which every client and scraper reads the same way.
function enc(s: string): string {
  return encodeURIComponent(s).replace(
    /[!'()*]/g,
    c => '%' + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${enc(message)}`;
}

function emailLink(subject: string, body: string): string {
  return `mailto:${EMAIL_ADDRESS}?subject=${enc(subject)}&body=${enc(body)}`;
}

// --- WhatsApp -------------------------------------------------------------

/** General interest — the floating button on the homepage. */
export const WHATSAPP_ENQUIRY = whatsappLink(
  "Hi! I'd like to know more about breathEN oxygen canisters."
);

/** Something went wrong mid-order — the checkout error fallback. */
export const WHATSAPP_ORDER_ISSUE = whatsappLink(
  'Hi! I was trying to place an order on the website but ran into an issue. ' +
  'Can you help me complete it?'
);

/** Order already placed — the thank-you page. */
export const WHATSAPP_ORDER_QUESTION = whatsappLink(
  'Hi! I just placed an order on breathen99.com and have a question.'
);

// --- Email ----------------------------------------------------------------

/** General interest — floating button, contact section, footer. */
export const EMAIL_ENQUIRY = emailLink(
  'Enquiry about breathEN',
  "Hi, I'd like to know more about breathEN oxygen canisters."
);

/** Something went wrong mid-order — the checkout error fallback. */
export const EMAIL_ORDER_ISSUE = emailLink(
  'Order issue on breathen99.com',
  'Hi, I ran into an issue while placing an order. Can you help?'
);
