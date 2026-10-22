import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { FiAlertTriangle, FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { footer, site } from '../../content/copy';
import { Logo } from './Logo';
import { MotionSwitch } from './Chrome';
import { useSectionLink } from './useSectionLink';

const SOCIAL_ICONS = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
} as const;

export function Footer() {
  const { href, onClick } = useSectionLink();
  const year = new Date().getFullYear();

  return (
    <footer className="footer theme-dark" data-nav-dark>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Logo />
            <p>{footer.about}</p>
            <div className="socials">
              {site.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.id];
                return (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`StepUp BD on ${social.label}`}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4>{footer.columns.shop}</h4>
            <ul className="footer-links">
              {footer.shopLinks.map((link) => (
                <li key={link.label}>
                  <a href={href(link.href)} onClick={(event) => onClick(event, link.href)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{footer.columns.help}</h4>
            <ul className="footer-links">
              {footer.helpLinks.map((link) => (
                <li key={link.label}>
                  <a href={href(link.href)} onClick={(event) => onClick(event, link.href)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{footer.columns.contact}</h4>
            <ul className="footer-links footer-contact">
              <li>
                <a href={`tel:${site.phoneDisplay.replace(/[^\d+]/g, '')}`}>
                  <FiPhone aria-hidden="true" /> {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>
                  <FiMail aria-hidden="true" /> {site.email}
                </a>
              </li>
              <li>
                <span>
                  <FiMapPin aria-hidden="true" /> {site.address}
                </span>
              </li>
              <li>
                <span>
                  <FiClock aria-hidden="true" /> {site.hours}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="demo-note">
            <FiAlertTriangle aria-hidden="true" /> {footer.demoNote}
          </p>
          <div className="footer-bottom-right">
            <MotionSwitch />
            <span>
              © {year} {site.name}
            </span>
            <span>
              {footer.crafted}{' '}
              <a href={site.builtBy.href} target="_blank" rel="noopener noreferrer">
                {site.builtBy.label}
              </a>
            </span>
          </div>
        </div>

        <p className="model-credit">
          <a href={footer.modelCredit.href} target="_blank" rel="noopener noreferrer">
            {footer.modelCredit.text}
          </a>{' '}
          (
          <a href={footer.modelCredit.license} target="_blank" rel="noopener noreferrer">
            licence
          </a>
          )
        </p>

        <p className="footer-word" aria-hidden="true">
          STEPUP BD
        </p>
      </div>
    </footer>
  );
}
