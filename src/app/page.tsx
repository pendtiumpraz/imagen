import { LandingNavbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PublicGallery } from "@/components/landing/PublicGallery";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default async function HomePage() {
  return (
    <>
      <LandingNavbar />
      <Hero />
      <Features />
      <PublicGallery />
      <Pricing />
      <Footer />
    </>
  );
}
