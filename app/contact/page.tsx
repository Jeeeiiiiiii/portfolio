"use client";
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { Mail, Phone, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';

const contactDetails = [
  { icon: Mail, label: 'email', value: 'aurjei.steven.carreon@gmail.com' },
  { icon: Phone, label: 'phone', value: '+63 976-493-7713' },
  { icon: MapPin, label: 'location', value: 'Cavite, PH' },
];

const socials = [
  { label: 'github', href: 'https://github.com/Jeeeiiiiiii' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/rjcarreon/' },
  { label: 'facebook', href: 'https://www.facebook.com/Jeiiiiiii04/' },
  { label: 'instagram', href: 'https://www.instagram.com/aurjeisteven/' },
];

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5 font-mono text-[13px] text-ink placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors duration-200';

export default function ContactPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  });

  const center = { lat: 14.431, lng: 120.967 }; // Coordinates for Cavite, PH

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 stagger">
        <header className="relative mb-10">
          <div className="halftone absolute -top-6 right-0 w-40 h-32 pointer-events-none" aria-hidden />
          <h1 className="page-title mb-3">contact</h1>
          <p className="micro">05 — have a project in mind? i&apos;d love to hear from you</p>
        </header>

        {/* Form */}
        <section className="mb-12">
          <h2 className="section-label mb-5">01 — send a message</h2>
          <form className="space-y-5 border border-gray-200 rounded-2xl p-6 bg-gray-50 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="micro block mb-2">your name</label>
                <input type="text" id="name" name="name" className={inputClass} placeholder="John Doe" required />
              </div>
              <div>
                <label htmlFor="email" className="micro block mb-2">email address</label>
                <input type="email" id="email" name="email" className={inputClass} placeholder="john@example.com" required />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="micro block mb-2">subject</label>
              <input type="text" id="subject" name="subject" className={inputClass} placeholder="Project Inquiry" required />
            </div>
            <div>
              <label htmlFor="message" className="micro block mb-2">message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className={inputClass}
                placeholder="Tell me about your project or inquiry..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-ink text-background text-xs px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity duration-200"
            >
              send message
            </button>
          </form>
        </section>

        {/* Details — hairline-divided cells */}
        <section className="mb-12">
          <h2 className="section-label mb-5">02 — details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-200 rounded-2xl overflow-hidden">
            {contactDetails.map((item, i) => (
              <div
                key={item.label}
                className={`p-5 border-gray-200 ${i > 0 ? 'border-t sm:border-t-0 sm:border-l' : ''}`}
              >
                <item.icon className="w-4 h-4 text-gray-400 mb-3" />
                <p className="micro mb-1">{item.label}</p>
                <p className="text-[13px] text-gray-500 break-words">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-5 mt-5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="micro hover:text-ink transition-colors duration-200"
              >
                {s.label} ↗
              </a>
            ))}
          </div>
        </section>

        {/* Map */}
        <section>
          <h2 className="section-label mb-5">03 — find me</h2>
          <div className="relative h-80 rounded-2xl overflow-hidden border border-gray-200 grayscale">
            {!isLoaded ? (
              <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <span className="micro status-dot">loading map</span>
              </div>
            ) : (
              <GoogleMap
                zoom={13}
                center={center}
                mapContainerClassName="w-full h-full"
              >
                <Marker position={center} />
              </GoogleMap>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
