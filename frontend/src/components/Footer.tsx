import {
  Facebook,
  Instagram,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
} from "lucide-react";
import { Link } from "react-router-dom";

// ── Brand icons not in lucide ────────────────────────────────────────────────
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.855L.057 23.882l6.221-1.453A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.359-.213-3.694.863.916-3.582-.234-.369A9.793 9.793 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
  </svg>
);

// ── Data ─────────────────────────────────────────────────────────────────────
const perks = [
  { icon: ShieldCheck, title: "100% Authentic", body: "Verified, sealed gadgets" },
  { icon: Truck, title: "Fast Delivery", body: "Same-day in Lagos" },
  { icon: RotateCcw, title: "Easy Returns", body: "30-day return window" },
  { icon: Headphones, title: "Real Support", body: "Humans, not bots" },
];

const socials = [
  { label: "Facebook", icon: Facebook, href: "#" },
  { label: "X", icon: XIcon, href: "#" },
  { label: "TikTok", icon: TikTokIcon, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
];

const shopLinks = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Categories", to: "/categories" },
  { label: "About Us", to: "/about" },
];

const companyLinks = ["Services", "Contact", "Blog", "Our Team"];

const linkClass =
  "text-sm text-primary-foreground/70 transition-colors hover:text-accent";

// ── Component ────────────────────────────────────────────────────────────────
const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* ── Perks strip ───────────────────────────────────────────────────── */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <p.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-primary-foreground/60">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12 md:gap-x-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5 lg:col-span-4">
            <Link to="/" className="mb-4 inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-base font-bold text-accent-foreground">
                G
              </span>
              <span className="text-xl font-bold tracking-tight">
                Gadget<span className="text-accent">Plug</span>
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              Genuine phones, laptops, tablets and accessories at honest prices,
              delivered fast across Nigeria.
            </p>
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-2 lg:col-span-2 lg:col-start-6">
            <h4 className="mb-4 text-sm font-semibold">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item}>
                  <a href="#" className={linkClass}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-3 lg:col-span-3">
            <h4 className="mb-4 text-sm font-semibold">Get in touch</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  Olayeni St, Alaba, Ojo Road
                  <br />
                  102103, Lagos, Nigeria
                </span>
              </li>
              <li>
                <a
                  href="https://wa.me/2348012345678"
                  className="flex items-center gap-3 text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-accent" />
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@gadgetplug.com"
                  className="flex items-center gap-3 text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent" />
                  <span className="break-all">hello@gadgetplug.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+2349039122681"
                  className="flex items-center gap-3 text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                  +234 903 912 2681
                </a>
              </li>
              <li>
                <a
                  href="tel:+2349030834024"
                  className="flex items-center gap-3 text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                  +234 903 083 4024
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-primary-foreground/60 sm:px-6 md:flex-row">
          <p>© {new Date().getFullYear()} GadgetPlug. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-accent">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-accent">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;