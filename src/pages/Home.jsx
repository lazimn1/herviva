import Hero from '../components/Hero';
import Collections from '../components/Collections';
import BrandStory from '../components/BrandStory';
import Lookbook from '../components/Lookbook';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';


export default function Home() {
  return (
    <>
      <Hero />
      <Collections />
      <BrandStory />
      <Lookbook />
      <Testimonials />
      <Footer />
    </>
  );
}
