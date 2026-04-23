import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesBar } from "@/components/home/CategoriesBar";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesBar />
      <FeaturedProducts />
      <ServicesSection />
      <WhyChooseUs />
    </>
  );
}
