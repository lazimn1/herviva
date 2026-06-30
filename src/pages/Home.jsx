import Hero from "../components/Hero";
import Collections from "../components/Collections";
import Products from "../components/Products";
import BrandStory from "../components/BrandStory";
import Lookbook from "../components/Lookbook";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <Collections />
      <Products />
      <BrandStory />
      <Lookbook />
      <Testimonials />
      <Newsletter />
    </>
  );
}
