import {
    Dumbbell,
    Flame,
    BicepsFlexed,
    CalendarSync,
    Rocket,
    HandCoins,
    Settings,
    CheckCheck,
  } from "lucide-react";
  import { useAuth } from "../../context/AuthContext";
  import "../../styles/Partnership.css";
  import "../../styles/AboutUs.css";
  
  const Partnership = () => {
    const { user } = useAuth(); // ✅ extract user
  
    return (
      <div className="partner-container">
        <h1 className="p-head">
          Are You A Gym Owner? <Dumbbell size={35} />
        </h1>
        <h2>Want to partner with us?</h2>
        <p>Fill out this form to onboard your gym:</p>
  
        {user ? (
          <a
            href="https://forms.gle/x3VyhZJceuMvZuaR9"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="form-button">Fill Out the Form</button>
          </a>
        ) : (
          <p className="form-restricted">
            ⚠️ You must be logged in to access the partnership form.
          </p>
        )}
  
        <h2 className="benefits-title">
          <BicepsFlexed size={28} /> Why Gym Owners Partner with Us
        </h2>
        <p>
          At <strong className="logol">NomadGym</strong>, we’re not just helping
          users find flexible workouts—we’re helping gyms unlock a new revenue
          stream and reach a fresh audience without any upfront cost.
        </p>
  
        <ul className="benefits-list">
          <li>
            <strong>
              <Flame size={24} /> Fill Empty Slots, Boost Revenue:
            </strong>{" "}
            Monetize underutilized time slots by opening your gym to short-term
            users—without affecting your regular members.
          </li>
          <li>
            <strong>
              <CalendarSync size={24} /> No Subscription. No Lock-in:
            </strong>{" "}
            We don’t charge you to join. You only earn when someone books your
            gym. No fixed fees.
          </li>
          <li>
            <strong>
              <Rocket size={24} /> Instant Visibility:
            </strong>{" "}
            Get listed on NomadGym and become discoverable by fitness lovers—
            especially travelers, remote workers, and newcomers.
          </li>
          <li>
            <strong>
              <HandCoins size={24} /> Payouts, Sorted:
            </strong>{" "}
            We handle payments and deposit your share automatically. Transparent
            and hassle-free.
          </li>
          <li>
            <strong>
              <Settings size={24} /> Zero Tech Setup:
            </strong>{" "}
            No need to build an app. Just share your availability—we do the rest.
          </li>
          <li>
            <strong>
              <CheckCheck size={24} /> Trusted Bookings:
            </strong>{" "}
            All users are verified and pre-paid. No walk-ins. No confusion.
          </li>
        </ul>
      </div>
    );
  };
  
  export default Partnership;
  