"use client";
import React, { useEffect, useState } from 'react'
import { apiGet } from '../../lib/api'

const Home1FaqSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet('/faqs'),
      apiGet('/config/home_faq_section')
    ])
      .then(([faqsData, configData]) => {
        setFaqs(faqsData || []);
        setConfig(configData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch FAQs or config:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  return (
    <div className="home1-faq-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10">
              <div className="section-title text-center mb-50 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                <h3>{config?.title || "Frequently Asked Questions"}</h3>
                <p>{config?.description || "It refers to a list of common questions and their corresponding answers that are typically provided on websites"}</p>
              </div>
              <div className="faq-wrap">
                <div className="accordion" id="accordionExample">
                  {faqs.map((faq, index) => (
                    <div key={faq._id || index} className="accordion-item wow animate fadeInDown" data-wow-delay={`${200 + (index * 100)}ms`} data-wow-duration="1500ms">
                      <h2 className="accordion-header" id={`heading${index}`}>
                        <button 
                          className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`} 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#collapse${index}`} 
                          aria-expanded={index === 0 ? "true" : "false"} 
                          aria-controls={`collapse${index}`}
                        >
                          {faq.question}
                        </button>
                      </h2>
                      <div 
                        id={`collapse${index}`} 
                        className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                        aria-labelledby={`heading${index}`} 
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Home1FaqSection
