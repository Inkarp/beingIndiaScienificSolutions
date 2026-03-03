import Hero from './Home/Hero';
import About from './Home/About';
import Offerings from './Home/Offerings';
import Blogs from './Home/Blogs';
import Customers from './Home/Customers';
import ProductsList from './Home/ProductsList';
import Products from './Home/Products';
import Testimonials from './Home/Testimonials';


export default function Home() {
  return (
    <div className="">
      <Hero />
      <Products />
      {/* <ProductsList /> */}
      <Offerings />
      <About />
      <Customers />
      <Blogs />
      <Testimonials />  
    </div>
  );
}
