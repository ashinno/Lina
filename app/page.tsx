import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Balloons from "@/components/Balloons";
import Memories from "@/components/Memories";
import Letter from "@/components/Letter";
import Game from "@/components/Game";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main className="relative">
      <Hero />
      <Marquee />
      <Balloons />
      <Memories />
      <Letter />
      <Game />
      <Footer />
    </main>
  );
}
