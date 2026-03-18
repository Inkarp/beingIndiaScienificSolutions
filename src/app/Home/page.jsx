import About from "./About";
import Blogs from "./Blogs";
import Customers from "./Customers";
import Hero from "./Hero";
import HeroNew from "./HeroNew";
import HeroOne from "./HeroOne";
import Products from "./Products";
import Testimonials from "./Testimonials";



export default function Home() {
  return (
    <div className="space-y-2">
      {/* <HeroNew />
      <HeroOne /> */}
      <Hero />    
      <Products />
      <About />
      <Customers />
      <Blogs />
      <Testimonials />  
    </div>
  );
}
