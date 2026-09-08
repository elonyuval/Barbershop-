import BookingWizard from "@/components/booking/BookingWizard";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SiteShell from "@/components/layout/SiteShell";
import Advantages from "@/components/sections/Advantages";
import Courses from "@/components/sections/Courses";
import CoursesStrip from "@/components/sections/CoursesStrip";
import Experience from "@/components/sections/Experience";
import Gallery from "@/components/sections/Gallery";
import Hero from "@/components/sections/Hero";
import Location from "@/components/sections/Location";
import Services from "@/components/sections/Services";
import Team from "@/components/sections/Team";
import Testimonials from "@/components/sections/Testimonials";

export default function HomePage() {
  return (
    <SiteShell>
      <Header />
      <main>
        <Hero />
        {/* One line under the hero; the full section sits further down so a
            visitor who came to book is not made to read about courses first. */}
        <CoursesStrip />
        <Services />
        <Team />
        <Gallery />
        <Courses />
        <Advantages />
        <Experience />
        <Testimonials />
        <BookingWizard />
        <Location />
      </main>
      <Footer />
    </SiteShell>
  );
}
