/**
 * Trust layer data.
 * All fields are shipped empty with TODO comments as instructed.
 * Render only what is filled; no placeholder text ever appears when a field is empty.
 */

export interface Testimonial {
  quote: string;
  name: string;
  project: string;
}

export interface TrustData {
  phone: string;
  email: string;
  licenceNumber: string;
  insuranceStatement: string;
  serviceTowns: string[];
  testimonials: Testimonial[];
}

export const trust: TrustData = {
  // TODO: Add official business phone number (rendered as tel: link in header menu, footer, contact page)
  phone: '',

  // TODO: Add official inquiry email
  email: '',

  // TODO: Add contractor licence number (rendered as quiet line in footer)
  licenceNumber: '',

  // TODO: Add verified insurance statement (rendered as quiet line in footer)
  insuranceStatement: '',

  // TODO: Add serviced towns (rendered as 'Serving ...' under closing CTA and in footer)
  serviceTowns: [],

  // TODO: Add client testimonials ({ quote, name, project })
  testimonials: [],
};

/**
 * Debug helper: with ?debug=1, logs warnings to console about empty trust fields.
 */
export function checkTrustDebug() {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === '1') {
      if (!trust.phone) console.warn('[MERES Trust] phone is empty');
      if (!trust.email) console.warn('[MERES Trust] email is empty');
      if (!trust.licenceNumber) console.warn('[MERES Trust] licenceNumber is empty');
      if (!trust.insuranceStatement) console.warn('[MERES Trust] insuranceStatement is empty');
      if (!trust.serviceTowns.length) console.warn('[MERES Trust] serviceTowns is empty');
      if (!trust.testimonials.length) console.warn('[MERES Trust] testimonials is empty');
    }
  } catch {
    /* ignore */
  }
}
