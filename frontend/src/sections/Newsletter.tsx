import { useState, type FormEvent } from 'react';
import { newsletter } from '../content/copy';
import { apiErrorMessage } from '../lib/api';
import { subscribeNewsletter } from '../services/storeService';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus({ tone: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setSending(true);
    try {
      const { message } = await subscribeNewsletter(email.trim());
      setStatus({ tone: 'ok', text: message });
      setEmail('');
    } catch (error) {
      setStatus({ tone: 'error', text: apiErrorMessage(error) });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="newsletter" aria-labelledby="nl-title">
      <div className="container newsletter-inner">
        <div>
          <h2 id="nl-title" className="section-title">
            {newsletter.title}
          </h2>
          <p>{newsletter.lede}</p>
        </div>
        <div>
          <form className="nl-form" onSubmit={onSubmit} noValidate>
            <label htmlFor="nl-email" className="sr-only">
              Email address
            </label>
            <input
              id="nl-email"
              type="email"
              autoComplete="email"
              placeholder={newsletter.placeholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={status?.tone === 'error'}
              aria-describedby="nl-msg"
              required
            />
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? 'Subscribing…' : newsletter.button}
            </button>
          </form>
          <p className="nl-msg" id="nl-msg" role="status">
            {status?.text}
          </p>
        </div>
      </div>
    </section>
  );
}
