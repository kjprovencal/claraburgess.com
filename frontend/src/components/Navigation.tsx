"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navigation() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm mb-8 rounded-b-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 lg:gap-8 text-base lg:text-lg font-semibold py-4 lg:py-6 justify-center">
          <Link 
            href="/" 
            className={`transition-all duration-200 hover:text-pink-600 ${
              isActive("/") ? "text-pink-600" : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Home
          </Link>
          {user ? (
            <>
              <Link 
                href="/about-me" 
                className={`transition-all duration-200 hover:text-pink-600 ${
                  isActive("/about-me") ? "text-pink-600" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                About Clara
              </Link>
              <Link 
                href="/about-us" 
                className={`transition-all duration-200 hover:text-pink-600 ${
                  isActive("/about-us") ? "text-pink-600" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                About Us
              </Link>
              <Link 
                href="/registry" 
                className={`transition-all duration-200 hover:text-pink-600 ${
                  isActive("/registry") ? "text-pink-600" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Registry
              </Link>
              <Link 
                href="/photos" 
                className={`transition-all duration-200 hover:text-pink-600 ${
                  isActive("/photos") ? "text-pink-600" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Photos
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className={`transition-all duration-200 hover:text-pink-700 ${
                    isActive("/admin") ? "text-pink-700" : "text-pink-600 hover:text-pink-700"
                  }`}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-colors duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" color="pink" />
                    <span>Logging out...</span>
                  </div>
                ) : (
                  "Logout"
                )}
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className={`transition-all duration-200 hover:text-pink-700 ${
                  isActive("/login") ? "text-pink-700" : "text-pink-600 hover:text-pink-700"
                }`}
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className={`transition-all duration-200 hover:text-blue-700 ${
                  isActive("/register") ? "text-blue-700" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between py-4">
            <div className="text-lg font-semibold text-gray-800">
              Clara's World
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-5 h-5" />
              ) : (
                <FaBars className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg rounded-b-2xl">
              <div className="px-4 py-4 space-y-3">
                <Link 
                  href="/" 
                  onClick={closeMobileMenu}
                  className={`block py-2 px-3 rounded-lg transition-all duration-200 ${
                    isActive("/") 
                      ? "bg-pink-50 text-pink-600" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Home
                </Link>
                {user ? (
                  <>
                    <Link 
                      href="/about-me" 
                      onClick={closeMobileMenu}
                      className={`block py-2 px-3 rounded-lg transition-all duration-200 ${
                        isActive("/about-me") 
                          ? "bg-pink-50 text-pink-600" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      About Clara
                    </Link>
                    <Link 
                      href="/about-us" 
                      onClick={closeMobileMenu}
                      className={`block py-2 px-3 rounded-lg transition-all duration-200 ${
                        isActive("/about-us") 
                          ? "bg-pink-50 text-pink-600" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      About Us
                    </Link>
                    <Link 
                      href="/registry" 
                      onClick={closeMobileMenu}
                      className={`block py-2 px-3 rounded-lg transition-all duration-200 ${
                        isActive("/registry") 
                          ? "bg-pink-50 text-pink-600" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Registry
                    </Link>
                    <Link 
                      href="/photos" 
                      onClick={closeMobileMenu}
                      className={`block py-2 px-3 rounded-lg transition-all duration-200 ${
                        isActive("/photos") 
                          ? "bg-pink-50 text-pink-600" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Photos
                    </Link>
                                        {isAdmin && (
                      <Link 
                        href="/admin" 
                        onClick={closeMobileMenu}
                        className={`block py-2 px-3 rounded-lg transition-all duration-200 ${
                          isActive("/admin") 
                            ? "bg-pink-50 text-pink-600" 
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Admin
                      </Link>
                    )}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          handleLogout();
                        }}
                        disabled={isLoading}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-colors duration-200 ${
                          isLoading 
                            ? "opacity-50 cursor-not-allowed text-gray-500" 
                            : "text-red-600 hover:bg-red-50 hover:text-red-700"
                        }`}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" color="pink" />
                            <span>Logging out...</span>
                          </div>
                          ) : (
                            "Logout"
                          )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      onClick={closeMobileMenu}
                      className={`block py-2 px-3 rounded-lg transition-all duration-200 ${
                        isActive("/login") 
                          ? "bg-pink-50 text-pink-600" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      onClick={closeMobileMenu}
                      className={`block py-2 px-3 rounded-lg transition-all duration-200 ${
                        isActive("/register") 
                          ? "bg-pink-50 text-blue-600" 
                          : "text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
