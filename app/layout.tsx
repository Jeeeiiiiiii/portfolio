import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { FaGithub, FaLinkedin, FaEnvelope, FaMediumM } from 'react-icons/fa';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Steven Carreon | Aspiring Cloud Engineer',
  description: 'Portfolio of Steven Carreon, an aspiring cloud engineer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 bg-gray-800 shadow-md z-10">
            <nav className="container mx-auto px-4 py-4">
              <ul className="flex space-x-6 justify-center">
                <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                <li><Link href="/projects" className="hover:text-blue-400 transition-colors">Projects</Link></li>
                <li><Link href="/skills" className="hover:text-blue-400 transition-colors">Skills</Link></li>
              </ul>
            </nav>
          </header>
          <main className="flex-grow">{children}</main>
          <footer className="bg-gray-800 mt-12">
            <div className="container mx-auto px-4 py-8 text-center">
              <p>&copy; {new Date().getFullYear()} Alex Johnson. All rights reserved.</p>
              <div className="flex justify-center space-x-6 mt-4">
                <a href="https://github.com/Jeeeiiiiiii" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  <FaGithub className="text-2xl" />
                  <span className="sr-only">GitHub</span>
                </a>
                <a href="https://www.linkedin.com/in/rjcarreon/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  <FaLinkedin className="text-2xl" />
                  <span className="sr-only">LinkedIn</span>
                </a>
                <a href="https://www.linkedin.com/in/rjcarreon/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  <FaMediumM className="text-2xl" />
                  <span className="sr-only">Medium</span>
                </a>
                <a href="mailto:aurjei.steven.carreon@gmail.com" className="hover:text-blue-400 transition-colors">
                  <FaEnvelope className="text-2xl" />
                  <span className="sr-only">Email</span>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

