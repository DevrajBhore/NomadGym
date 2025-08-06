// user/MakePayment.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API from "../../api/axiosConfig";
import Loader from "../../components/Loader";
import "../../styles/MakePayment.css";

const MakePayment = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [razorpayOrder, setRazorpayOrder] = useState(null);

  useEffect(() => {
    if (location.state?.order) {
      setRazorpayOrder(location.state.order);
      setBookingDetails({
        _id: bookingId,
        amount: location.state.order.amount / 100,
      });
      setLoading(false);
    } else {
      const fetchBookingDetails = async () => {
        try {
          const response = await API.get("/bookings/my-bookings");
          const foundBooking = response.data.bookings.find(
            (b) => b._id === bookingId
          );
          if (foundBooking) {
            setBookingDetails(foundBooking);
            setError(
              "Payment session expired. Please re-initiate booking from gym details."
            );
          } else {
            setError("Booking not found.");
          }
        } catch (err) {
          console.error("Booking fetch error:", err);
          setError("Unable to load booking. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchBookingDetails();
    }
  }, [bookingId, location.state]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    setError("");
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      setError("Razorpay failed to load. Check your internet connection.");
      return;
    }

    if (!razorpayOrder || !bookingDetails) {
      setError(
        "Missing order or booking info. Please restart the booking process."
      );
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, //
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "NomadGym",
      description: "Secure Payment",
      order_id: razorpayOrder.id,
      handler: async (response) => {
        try {
          const verify = await API.post("/bookings/confirm", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: bookingDetails._id, 
          });

          if (verify.status === 200) {
            navigate(`/confirmation/${bookingDetails._id}`, {
              state: { success: true },
            });
          } else {
            setError("Payment verification failed. Please contact support.");
          }
        } catch (err) {
          console.error("Payment verify error:", err);
          setError(err.response?.data?.error || "Payment failed. Try again.");
        }
      },

      prefill: {
        name: "NomadGym User",
        email: "user@example.com",
        contact: "9999999999",
      },
      notes: {
        booking_id: bookingId,
      },
      theme: {
        color: "#007AFF",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) return <Loader />;

  if (error && !bookingDetails)
    return <div className="error-message-center">{error}</div>;

  return (
    <div className="make-payment-container">
      <div className="payment-card card-base">
        <h2>Complete Payment</h2>
        {error && <p className="error-message">{error}</p>}

        {bookingDetails && (
          <div className="payment-summary">
            <p>
              Booking ID:{" "}
              <strong>{bookingDetails._id.substring(0, 8)}...</strong>
            </p>
            <p>
              Amount:{" "}
              <strong className="amount-display">
                ₹{bookingDetails.amount}
              </strong>
            </p>
          </div>
        )}

        <button onClick={displayRazorpay} className="pay-button button-primary">
          Pay Now with Razorpay
        </button>
        <p className="payment-note">
          You’ll be redirected to Razorpay’s gateway.
        </p>
      </div>
    </div>
  );
};

export default MakePayment;
