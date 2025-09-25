"use client";

import React from "react";

export default function AboutUsPage() {
  return (
    <div className="mb-16">
      {/* Main Card Surface */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Subtle Background Pattern - Full Height */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
            About Us
          </h1>

          {/* Couple Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Our Story
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                We&apos;re Natalie and Kyle, and we&apos;re absolutely thrilled
                to be welcoming our first child, Clara, into the world! Our
                journey to parenthood has been filled with love, excitement, and
                countless moments of joy.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                We met and fell in love, building a life together filled with
                adventures, laughter, and dreams of starting a family. Now that
                dream is becoming reality, and we couldn&apos;t be more grateful
                for the love and support of our family and friends.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                As we prepare for Clara&apos;s arrival, we&apos;re learning that
                parenthood is about more than just diapers and sleepless
                nights—it&apos;s about creating a home filled with love,
                teaching values, and watching our little one grow into the
                amazing person she&apos;s meant to be.
              </p>
            </div>
          </div>

          {/* Natalie Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Meet Natalie
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    The Future Mom
                  </h3>
                  <div className="mb-4">
                    <span className="inline-block bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                      Private Nanny
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Natalie is the heart of our family, bringing warmth,
                    creativity, and endless love to everything she does. Her
                    nurturing spirit and gentle nature make her the perfect
                    mother-to-be.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    As a private nanny, Natalie has years of experience caring
                    for children of all ages, which gives her incredible insight
                    into child development, behavior, and the daily rhythms of
                    family life. She&apos;s been absolutely amazing throughout
                    this pregnancy, embracing every moment with grace and
                    excitement.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Her maternal instincts are already shining through as she
                    carefully plans and prepares for Clara&apos;s arrival. Clara
                    is so lucky to have such an experienced and loving mama!
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-pink-500">👩‍👧</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kyle Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Meet Kyle
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-right order-2 md:order-1">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-blue-500">👨‍👧</span>
                  </div>
                </div>
                <div className="text-center md:text-left order-1 md:order-2">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    The Future Dad
                  </h3>
                  <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                      Software Engineer
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    Kyle is the rock of our family, providing strength,
                    stability, and unwavering support. His protective nature and
                    loving heart make him the perfect father-to-be.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    As a software developer, Kyle brings his analytical mind,
                    problem-solving skills, and attention to detail to
                    everything he does. Throughout this pregnancy, he&apos;s
                    been incredibly supportive, attending every appointment,
                    reading parenting books, and already practicing his dad
                    jokes (much to Natalie&apos;s amusement).
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    His dedication, patience, and sense of humor will make him
                    an amazing father. Clara will grow up feeling safe, loved,
                    and always entertained!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Values Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Our Values
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                  <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white">❤️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Unconditional Love
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We believe in loving Clara for exactly who she is,
                    supporting her dreams, and being her biggest cheerleaders.
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white">🌱</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Growth & Learning
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We&apos;re committed to learning and growing as parents,
                    embracing challenges, and always striving to be better.
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-white">🏠</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Family First
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Family is our foundation. We&apos;ll create a home filled
                    with laughter, traditions, and endless love.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Looking Forward Section */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Looking Forward
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                As we count down the days until Clara&apos;s arrival, we&apos;re
                filled with excitement and gratitude. We can&apos;t wait to hold
                her in our arms, watch her first smile, hear her first laugh,
                and experience all the beautiful moments that parenthood brings.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                We&apos;re so thankful for the love and support of our family
                and friends during this special time. Your encouragement,
                advice, and excitement mean the world to us.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Thank you for being part of our journey to parenthood. We
                can&apos;t wait to introduce you to our little miracle, Clara!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
