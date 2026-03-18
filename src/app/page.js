import Hero from './home/Hero';
import About from './home/About';
import Blogs from './home/Blogs';
import Customers from './home/Customers';
import Products from './home/Products';
import Testimonials from './home/Testimonials';
import HeroNew from './home/HeroNew';
import HeroOne from './home/HeroOne';


export default function Home() {
  return (
    <div className="space-y-2">
      {/* <HeroNew />
      <HeroOne />
      <Hero />    
      <Products />
      <About />
      <Customers />
      <Blogs />
      <Testimonials />   */}
      <HeroOne />
    </div>
  );
}
