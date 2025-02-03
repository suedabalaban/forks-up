import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = {
    company: [
        { text: 'About Us', path: '/about' },
        { text: 'Contact', path: '/contact' },
        { text: 'Careers', path: '/careers' },
    ],
    legal: [
        { text: 'Privacy Policy', path: '/privacy' },
        { text: 'Terms of Service', path: '/terms' },
        { text: 'Cookie Policy', path: '/cookies' },
    ],
    social: [
        { text: 'Twitter', path: 'https://twitter.com' },
        { text: 'Facebook', path: 'https://facebook.com' },
        { text: 'Instagram', path: 'https://instagram.com' },
    ],
};

const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
                                    >
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
                                    >
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Social</h3>
                        <ul className="space-y-3">
                            {footerLinks.social.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
                                    >
                                        {link.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Forks Up. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;