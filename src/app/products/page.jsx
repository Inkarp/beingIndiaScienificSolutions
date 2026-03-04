import Offerings from "../Home/Offerings";
import Products from "../Home/Products";
import ProductsList from "../Home/ProductsList";
import Verticals from "./Verticals";
import VerticalsNew from "./VerticalsNew";
import VerticalsNewOne from "./VerticalsNewOne";

export default function Page() {
  return (
    <div>
      <Offerings />
      <VerticalsNewOne />
      <VerticalsNew />
      <Verticals />
      <Products />
    </div>
  )
}