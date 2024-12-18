import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa'

export default function Socials() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-12 text-center">Connect with Me</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        <a 
          href="https://github.com/yourusername" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          <FaGithub className="text-4xl mr-4" />
          <span className="text-xl">GitHub</span>
        </a>
        <a 
          href="https://linkedin.com/in/yourusername" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          <FaLinkedin className="text-4xl mr-4" />
          <span className="text-xl">LinkedIn</span>
        </a>
        <a 
          href="https://twitter.com/yourusername" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          <FaTwitter className="text-4xl mr-4" />
          <span className="text-xl">Twitter</span>
        </a>
        <a 
          href="mailto:your.email@example.com" 
          className="flex items-center justify-center p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          <FaEnvelope className="text-4xl mr-4" />
          <span className="text-xl">Email</span>
        </a>
      </div>
    </div>
  )
}

