import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import AboutSection from '../components/Home/AboutSection';
import HowItWorks from '../components/Home/HowItWorks';
import StatsSection from '../components/Home/StatsSection';
import RecentReports from '../components/Home/RecentReports';

const Home = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <HowItWorks />
      <StatsSection />
      <RecentReports />
    </>
  );
};

export default Home;
