import Layout from "@/components/Layout";
import Banner1 from "@/components/home/Banner1";
import Home1AboutSection from "@/components/home/Home1AboutSection";
import Home1FeatureSection from "@/components/home/Home1FeatureSection";
import Home1GeneralArtSliderSection from "@/components/home/Home1GeneralArtSliderSection";
import Home1UpcomingAuctionSliderSection from "@/components/home/Home1UpcomingAuctionSliderSection";
import Home1ArtistSection from "@/components/home/Home1ArtistSection";
import Home1TestimonialSection from "@/components/home/Home1TestimonialSection";
import Home1ArticleSection from "@/components/home/Home1ArticleSection";
import Home1FaqSection from "@/components/home/Home1FaqSection";

export default function Home1() {
  return (
    <Layout>
      <Banner1 />
      <Home1AboutSection />
      <Home1FeatureSection />
      <Home1GeneralArtSliderSection />
      <Home1UpcomingAuctionSliderSection />
      <Home1ArtistSection />
      <Home1TestimonialSection />
      <Home1ArticleSection />
      <Home1FaqSection />
    </Layout>
  );
}
