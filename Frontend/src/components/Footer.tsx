import { Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Follow Us */}
          <div>
            <h4 className="font-semibold mb-4 text-primary-foreground">Follow us</h4>
            <div className="flex gap-2 mb-4">
              <a href="#" className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <Facebook className="w-4 h-4 text-accent-foreground" />
              </a>
              <a href="#" className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-4 h-4 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-4 h-4 text-accent-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <Instagram className="w-4 h-4 text-accent-foreground" />
              </a>
            </div>
            <p className="text-sm text-primary-foreground/80 font-medium">AbyGadgets.Ent</p>
            <p className="text-sm text-primary-foreground/70 mt-2">
              Olayeni St, Alaba, Ojo Road<br />
              102103, Lagos, Nigeria.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                  <span className="text-accent-foreground text-xs font-bold">A</span>
                </div>
                <span className="font-bold text-sm text-accent">Aby Gadgets</span>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="font-semibold mb-4 text-primary-foreground">Contact us</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-accent hover:underline">WhatsApp</a></li>
              <li><a href="mailto:abygadgets@gmail.com" className="text-accent hover:underline">abygadgets@gmail.com</a></li>
              <li><a href="tel:+2349039122681" className="text-primary-foreground/80">+234 903 912 2681</a></li>
              <li><a href="tel:+2349030834024" className="text-accent hover:underline">+234 903 083 4024</a></li>
            </ul>
          </div>

          {/* Catalogs */}
          <div>
            <h4 className="font-semibold mb-4 text-primary-foreground">Catalogs</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-accent transition-colors">Products</Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">Category</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">About</a></li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h4 className="font-semibold mb-4 text-primary-foreground">About us</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-accent transition-colors">Services</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contacts</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Blogs</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Our teams</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-primary-foreground/70">
          <a href="#" className="hover:text-accent transition-colors">Policy</a>
          <span className="hidden md:inline">•</span>
          <a href="#" className="hover:text-accent transition-colors">Our Terms And Condition</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
