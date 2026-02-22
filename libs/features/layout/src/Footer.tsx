import { Link } from 'react-router-dom';
import { Ticket, Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { Separator, Button } from '@ticketing/ui';

const footerLinks = {
  events: [
    { label: 'Music', href: '/events?genre=music' },
    { label: 'Sports', href: '/events?genre=sports' },
    { label: 'Theater', href: '/events?genre=theater' },
    { label: 'Comedy', href: '/events?genre=comedy' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refunds' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-background to-muted/30 border-t border-border/40">
      {/* Main Footer Content */}
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25 transition-shadow group-hover:shadow-violet-500/40">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                EventTix
              </span>
            </Link>

            <p className="text-muted-foreground max-w-xs leading-relaxed">
              Your gateway to unforgettable experiences. Book tickets for concerts, sports, theater, and more.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <a
                href="mailto:hello@eventtix.com"
                className="flex items-center gap-3 hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                hello@eventtix.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" />
                +1 (234) 567-890
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                New York, NY 10001
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12">
            {/* Events */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Events</h4>
              <ul className="space-y-3">
                {footerLinks.events.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} EventTix. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
