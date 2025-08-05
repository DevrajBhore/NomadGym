// user/AboutUs.jsx
import { Target, Sparkle, Lightbulb, Dumbbell } from "lucide-react";
import "../../styles/AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-container">
      <h1>About Us</h1>
      <p>
        At <strong className="logol">NomadGym</strong>, we’re redefining how
        fitness fits into your life.
      </p>
      <p>
        We’re building a world where you can work out wherever you are, without
        being tied down by long-term contracts, expensive memberships, or fixed
        locations. Whether you're traveling, relocating, or just want the
        freedom to choose where and when you train,{" "}
        <strong className="logol">NomadGym</strong> gives you access to a
        growing network of partner gyms pay-per-hour/use, no strings attached.
      </p>
      <p>
        We’re not just a platform. We’re a movement for the modern, mobile
        lifestyle. For the digital nomads. The city-hoppers. The spontaneous.
        <br />
        Your schedule changes. Your city changes. Your mood changes.
        <br />
        Now, your gym can too.
      </p>
      {/* <blockquote>
        No hidden fees. No paperwork. Just tap, train, and go.
      </blockquote> */}

      <h2>
        <Target size={28} /> Our Mission
      </h2>
      <p>
        To make fitness as flexible and dynamic as the people who pursue it.
      </p>

      <h2>
        <Sparkle size={28} /> Our Vision
      </h2>
      <p>
        Nomad Gym’s vision is to redefine fitness by offering flexible,
        movement-based workouts that adapt to your lifestyle.
      </p>

      <h2>
        <Lightbulb size={28} /> Why We Exist
      </h2>
      <p>
        Because life doesn’t stick to one location and neither should your gym.
      </p>

      {/* <h1>Are you a Gym owner? <Dumbbell size={30} /></h1>
      <h3>And want </h3> */}
    </div>
  );
};

export default AboutUs;
