import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-red-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-amber-400">
              LD Comedy
            </Link>
            <p className="mt-4 text-gray-300 max-w-md">
              Le temple du rire à Paris. Découvrez les meilleurs talents du stand-up dans une ambiance unique et chaleureuse.
            </p>
            <div className="mt-6 flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-black/30 rounded-full flex items-center justify-center text-amber-400 hover:bg-amber-400 hover:text-red-950 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-amber-400">Navigation</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/spectacles" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Spectacles
                </Link>
              </li>
              <li>
                <Link href="/comediens" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Artistes
                </Link>
              </li>
              <li>
                <Link href="/actualites" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Actualités
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-amber-400">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li className="text-gray-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@ldcomedy.fr
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                01 23 45 67 89
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                123 rue du Rire, Paris
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-amber-400/20 text-center text-gray-400">
          <p>© {new Date().getFullYear()} LD Comedy. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
