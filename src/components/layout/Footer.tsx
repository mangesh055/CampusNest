import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Mail, Phone, MapPin } from 'lucide-react'

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
)
const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
)
const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
)
const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
)
const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
)

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">
                FlatsN<span className="gradient-text">Foods</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              India's smartest platform for student housing and digital mess management. 
              Find PGs, hostels, flats, and mess services near your college.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-brand-600 transition-colors group"
                >
                  <Icon className="w-4 h-4 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-3 text-sm">
              {['Find PG', 'Find Hostel', 'Find Flat', 'Mess Services', 'Tiffin Services', 'Roommate Finder'].map(item => (
                <li key={item}>
                  <Link to="/properties" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Owners */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-4">For Owners</h4>
            <ul className="space-y-3 text-sm">
              {['List Property', 'Register Mess', 'Owner Dashboard', 'Analytics', 'Pricing', 'Success Stories'].map(item => (
                <li key={item}>
                  <Link to="/auth" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-400 flex-shrink-0" />
                <span>123 Tech Hub, Pune, Maharashtra 411001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="tel:+918999295362" className="hover:text-white transition-colors">+91 8999 295 362 / 7517 807 405</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="mailto:hello@flatsnfoods.in" className="hover:text-white transition-colors">hello@flatsnfoods.in</a>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="text-white text-sm font-semibold mb-2">Download App</h5>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs flex items-center gap-1.5 hover:bg-slate-700 cursor-pointer transition-colors">
                  <span>📱</span> App Store
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs flex items-center gap-1.5 hover:bg-slate-700 cursor-pointer transition-colors">
                  <span>🤖</span> Play Store
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2026 FlatsNFoods. All rights reserved. Built with ❤️ for Indian students.</p>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 mt-4 sm:mt-0">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link to="/community-guidelines" className="hover:text-white transition-colors">Community Guidelines</Link>
            <Link to="/grievance-redressal" className="hover:text-white transition-colors">Grievance Redressal</Link>
            <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
