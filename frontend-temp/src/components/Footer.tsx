import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Top grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">

          {/* Brand + Social */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-accent-foreground text-sm font-bold">A</span>
              </div>
              <span className="font-bold text-base text-accent">Aby Gadgets</span>
            </div>
            <p className="text-sm text-primary-foreground/70 mb-4 leading-relaxed max-w-[200px]">
              Olayeni St, Alaba, Ojo Road<br />
              102103, Lagos, Nigeria.
            </p>
            <h4 className="font-semibold mb-3 text-sm">Follow us</h4>
            <div className="flex gap-2.5">
              {[
                { icon: Facebook, href: "#" },
                {
                  icon: () => (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ),
                  href: "#",
                },
                {
                  icon: () => (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  ),
                  href: "#",
                },
                { icon: Instagram, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:opacity-80 transition-opacity text-accent-foreground"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Contact us</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://wa.me/2348012345678" className="text-accent hover:underline flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.855L.057 23.882l6.221-1.453A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.359-.213-3.694.863.916-3.582-.234-.369A9.793 9.793 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                  </svg>
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:abygadgets@gmail.com" className="text-accent hover:underline flex items-center gap-2 break-all">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="break-all">abygadgets@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+2349039122681" className="text-primary-foreground/80 hover:text-accent flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  +234 903 912 2681
                </a>
              </li>
              <li>
                <a href="tel:+2349030834024" className="text-accent hover:underline flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  +234 903 083 4024
                </a>
              </li>
            </ul>
          </div>

          {/* Catalogs */}
          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Catalogs</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              {[
                { label: "Home",       to: "/"           },
                { label: "Products",   to: "/products"   },
                { label: "Categories", to: "/categories" },
                { label: "About",      to: "/about"      },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-accent transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-4 text-sm sm:text-base">About us</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              {["Services", "Contacts", "Blogs", "Our teams"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-accent transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/10 pt-5 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-5 text-sm text-primary-foreground/60">
          <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
          <span className="hidden sm:inline">•</span>
          <a href="#" className="hover:text-accent transition-colors">Terms & Conditions</a>
          <span className="hidden sm:inline">•</span>
          <span className="text-primary-foreground/40">© 2025 Aby Gadgets. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;