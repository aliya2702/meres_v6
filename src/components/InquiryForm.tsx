import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { gsap, SplitText } from '@/motion/gsap';
import { isReduced } from '@/motion/tokens';
import { contact } from '@/content/copy';
import { Mark } from './Mark';

/*
 * Project inquiry form.
 * Inquiries are intended for info@meres.co. Delivery MUST be configured (VITE_FORM_ENDPOINT → a
 * service that forwards to info@meres.co) and tested before launch. Without an endpoint the form
 * runs in Demo mode and never claims that anything was sent.
 */
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT?.trim();
const f = contact.form;

type Values = {
  name: string;
  email: string;
  city: string;
  type: string;
  project: string;
  phone: string;
  timing: string;
  budget: string;
};
type Errors = Partial<Record<keyof Values, string>>;
const initial: Values = { name: '', email: '', city: '', type: '', project: '', phone: '', timing: '', budget: '' };

const validate = (v: Values): Errors => {
  const e: Errors = {};
  if (!v.name.trim()) e.name = 'Please enter your name so we know who to reply to.';
  if (!v.email.trim()) e.email = 'Please enter your email address so we can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = 'Please check your email address — it should look like name@example.com.';
  if (!v.city.trim()) e.city = 'Please enter your project city so we know where the home is.';
  if (!v.type) e.type = 'Please choose a project type. “Not sure yet” is a fine answer.';
  if (!v.project.trim()) e.project = 'Please tell us about your project — a sentence or two is enough to begin.';
  return e;
};

const order: (keyof Values)[] = ['name', 'email', 'city', 'type', 'project'];

export function InquiryForm() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (k: string) => `${k}-${uid}`;
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'demo' | 'success'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formWrap = useRef<HTMLDivElement>(null);

  const set = (k: keyof Values) => (e: { target: { value: string } }) => {
    const val = e.target.value;
    setValues((v) => ({ ...v, [k]: val }));
    if (touched[k]) setErrors((er) => ({ ...er, [k]: validate({ ...values, [k]: val })[k] }));
  };
  const blur = (k: keyof Values) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((er) => ({ ...er, [k]: validate(values)[k] }));
  };

  const showSuccess = () => {
    setStatus('success');
    const wrap = formWrap.current;
    const done = () => {
      requestAnimationFrame(() => {
        const s = successRef.current;
        if (!s) return;
        s.focus({ preventScroll: true });
        if (isReduced()) return;
        const paths = s.querySelectorAll('.mark-path');
        gsap.fromTo(paths, { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.34, stagger: 0.09, ease: 'meres.out' });
        const msg = s.querySelector<HTMLElement>('.success-msg');
        if (msg) {
          const split = SplitText.create(msg, { type: 'lines', mask: 'lines' });
          gsap.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.09, ease: 'meres.out', delay: 0.6 });
        }
      });
    };
    if (wrap && !isReduced()) {
      gsap.to(wrap, { height: 0, opacity: 0, duration: 0.8, ease: 'meres.inOut', onComplete: done });
    } else done();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return; // prevent double submits
    const errs = validate(values);
    setErrors(errs);
    setTouched({ name: true, email: true, city: true, type: true, project: true });
    const firstBad = order.find((k) => errs[k]);
    if (firstBad) {
      const el =
        firstBad === 'type'
          ? formRef.current?.querySelector<HTMLInputElement>(`input[name="type"]`)
          : formRef.current?.querySelector<HTMLElement>(`#${id(firstBad)}`);
      el?.focus();
      return;
    }
    if (!ENDPOINT) {
      setStatus('demo');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, source: 'meres-website', to: 'info@meres.co' }),
      });
      if (res.ok) showSuccess();
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  const err = (k: keyof Values) => (touched[k] ? errors[k] : undefined);

  return (
    <div id="project-inquiry" className="scroll-mt-[var(--header-h)]">
      {!ENDPOINT && (
        <div className="form-fade mb-10 flex items-start gap-3 border border-taupe-deep/50 bg-linen-deep px-5 py-4" role="note">
          <InfoIcon />
          <p className="text-[1.1875rem] leading-snug">Demo mode — this form is not connected yet. Nothing will be sent.</p>
        </div>
      )}

      <div ref={formWrap} className="overflow-hidden">
        <form ref={formRef} noValidate onSubmit={onSubmit} aria-describedby={id('key')} className="flex flex-col gap-10">
          <p id={id('key')} className="form-fade text-[1.1875rem] text-ink/80">
            {f.requiredKey}
          </p>

          <Field id={id('name')} label={f.name} required error={err('name')}>
            <input id={id('name')} name="name" type="text" autoComplete="name" className="field-input" value={values.name} onChange={set('name')} onBlur={blur('name')} {...a11y(id('name'), err('name'))} />
          </Field>
          <Field id={id('email')} label={f.email} required error={err('email')}>
            <input id={id('email')} name="email" type="email" autoComplete="email" inputMode="email" className="field-input" value={values.email} onChange={set('email')} onBlur={blur('email')} {...a11y(id('email'), err('email'))} />
          </Field>
          <Field id={id('city')} label={f.city} required error={err('city')}>
            <input id={id('city')} name="city" type="text" autoComplete="address-level2" className="field-input" value={values.city} onChange={set('city')} onBlur={blur('city')} {...a11y(id('city'), err('city'))} />
          </Field>

          <fieldset className="field form-fade" aria-required="true" aria-invalid={err('type') ? true : undefined} aria-describedby={err('type') ? `${id('type')}-err` : undefined}>
            <legend className="field-label">
              {f.type} <span aria-hidden="true">*</span>
            </legend>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {f.typeChoices.map((c) => (
                <label key={c} className="radio-card">
                  <input
                    type="radio"
                    name="type"
                    value={c}
                    checked={values.type === c}
                    onChange={(e) => {
                      set('type')(e);
                      setTouched((t) => ({ ...t, type: true }));
                      setErrors((er) => ({ ...er, type: undefined }));
                    }}
                    aria-required="true"
                  />
                  <span>{c}</span>
                  <svg className="tick" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <path d="M0 1H13V14" />
                  </svg>
                </label>
              ))}
            </div>
            {err('type') && <ErrorText id={`${id('type')}-err`}>{err('type')}</ErrorText>}
          </fieldset>

          <Field id={id('project')} label={f.project} required error={err('project')} hint={f.projectGuidance}>
            <textarea id={id('project')} name="project" rows={6} className="field-input" value={values.project} onChange={set('project')} onBlur={blur('project')} {...a11y(id('project'), err('project'), true)} />
          </Field>

          {/* Visible, not collapsed */}
          <fieldset className="form-fade border-t border-[var(--hairline)] pt-8">
            <legend className="d4 float-left mb-8 w-full">{f.optionalTitle}</legend>
            <div className="clear-both flex flex-col gap-10">
              <Field id={id('phone')} label={f.phone}>
                <input id={id('phone')} name="phone" type="tel" autoComplete="tel" className="field-input" value={values.phone} onChange={set('phone')} />
              </Field>
              <Field id={id('timing')} label={f.timing} hint={f.timingGuidance}>
                <input id={id('timing')} name="timing" type="text" className="field-input" value={values.timing} onChange={set('timing')} aria-describedby={`${id('timing')}-hint`} />
              </Field>
              <Field id={id('budget')} label={f.budget} hint={f.budgetGuidance}>
                <input id={id('budget')} name="budget" type="text" className="field-input" value={values.budget} onChange={set('budget')} aria-describedby={`${id('budget')}-hint`} />
              </Field>
            </div>
          </fieldset>

          <div className="form-fade">
            <h2 className="field-label">{f.nextTitle}</h2>
            <p className="body-copy text-ink/85">{f.next}</p>
          </div>

          <div className="form-fade flex flex-col gap-5">
            <div aria-live="assertive" role="alert" className="min-h-0">
              {status === 'error' && (
                <ErrorText id={id('submit-err')} big>
                  {f.error}
                </ErrorText>
              )}
            </div>
            <div aria-live="polite">
              {status === 'demo' && (
                <p className="flex items-start gap-3 border border-taupe-deep/50 bg-linen-deep px-5 py-4 text-[1.1875rem]">
                  <InfoIcon />
                  Demo mode: your details were not sent.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <button type="submit" className="cta cta-lg cta--solid relative" disabled={status === 'sending'} aria-disabled={status === 'sending'} data-cursor="cta">
                {status === 'sending' ? (
                  <>
                    <span>Sending…</span>
                    <span className="sending-line absolute bottom-[10px] left-[1.8em] right-[1.8em] h-px origin-left bg-linen" aria-hidden="true" />
                  </>
                ) : (
                  <span className="cta-roll" data-label={f.submit}>
                    <span>{f.submit}</span>
                    <span aria-hidden="true">{f.submit}</span>
                  </span>
                )}
              </button>
              <Link to="/privacy" className="link-draw is-underlined">
                {f.privacy}
              </Link>
            </div>
          </div>
        </form>
      </div>

      {status === 'success' && (
        <div ref={successRef} tabIndex={-1} className="flex flex-col items-start gap-10 py-10 outline-none" role="status">
          <Mark className="h-24 w-auto text-forest" />
          <p className="success-msg d4 max-w-[30ch]">{f.success}</p>
        </div>
      )}
    </div>
  );
}

const a11y = (fid: string, error?: string, hint?: boolean) => ({
  'aria-required': true as const,
  'aria-invalid': error ? (true as const) : undefined,
  'aria-describedby': [hint ? `${fid}-hint` : '', error ? `${fid}-err` : ''].filter(Boolean).join(' ') || undefined,
});

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field form-fade" data-invalid={error ? 'true' : undefined}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      <div className="field-control">
        {children}
        <span className="field-line" aria-hidden="true" />
      </div>
      {error && <ErrorText id={`${id}-err`}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ id, children, big }: { id: string; children: ReactNode; big?: boolean }) {
  return (
    <p id={id} className={`field-error ${big ? 'border border-[#8a3b2e]/40 px-5 py-4' : ''}`}>
      <svg className="mt-[0.3em] shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="8" cy="8" r="7" />
        <path d="M8 4v5M8 11.2v.6" />
      </svg>
      <span>
        <span className="sr-only">Error: </span>
        {children}
      </span>
    </p>
  );
}

function InfoIcon() {
  return (
    <svg className="mt-[0.3em] shrink-0" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <circle cx="9" cy="9" r="8" />
      <path d="M9 8v5M9 5.2v.6" />
    </svg>
  );
}
