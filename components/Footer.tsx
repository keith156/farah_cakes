
import React from 'react';

interface FooterProps {
  onStaffClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onStaffClick }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div>
          <h3 className="text-white text-2xl font-serif mb-6">Farah Cakes</h3>
          <p className="max-w-xs mx-auto md:mx-0">Bringing joy through artistic baking and premium ingredients since 2020.</p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6">Connect</h4>
          <ul className="space-y-3">
            <li><a href="#" className="hover:text-rose-gold transition"><i className="fa-brands fa-instagram mr-2"></i> Instagram</a></li>
            <li><a href="#" className="hover:text-rose-gold transition"><i className="fa-brands fa-facebook mr-2"></i> Facebook</a></li>
            <li><a href="tel:+256758339221" className="hover:text-rose-gold transition"><i className="fa-solid fa-phone mr-2"></i> Call Us</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6">Staff Access</h4>
          <ul className="space-y-3">
            <li>
              <button 
                onClick={onStaffClick}
                className="text-slate-500 hover:text-rose-gold text-sm transition"
              >
                Staff Login
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Farah Cakes. Crafted with ❤️ for sweet lovers.</p>
      </div>
    </footer>
  );
};

export default Footer;
