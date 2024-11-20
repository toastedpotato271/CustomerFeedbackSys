import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import db from "../firebaseConfig";
import AddReviewModal from "../components/AddReviewModal";
import "./Dashboard.css";
import logo from "../img/starplus-logo.png";
import bannerImage from "../img/banner-design.jpg";

const Dashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingsBreakdown, setRatingsBreakdown] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal state

  // Fetch reviews and calculate metrics
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsCollection = collection(db, "reviews");
        const snapshot = await getDocs(reviewsCollection);
        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReviews(reviewsData);

        // Calculate average rating and breakdown
        const totalReviews = reviewsData.length;
        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalRating = 0;

        reviewsData.forEach((review) => {
          const rating = review.rating;
          ratingCounts[rating] += 1;
          totalRating += rating;
        });

        setRatingsBreakdown(ratingCounts);
        setAverageRating(totalReviews > 0 ? totalRating / totalReviews : 0);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="logo">
            <img src={logo} alt="StarPlus Logo" className="header-logo" />
        </div>
        <button className="logout-button">Logout</button>
      </header>

      {/* Banner Section */}
      <section className="banner">
        <div className="banner-container">
            <img src={bannerImage} alt="Banner Design" className="banner-image" />
        </div>
      </section>



      {/* Main Content Section */}
      <section className="content">
        <div className="overview">
          <h2>Overview</h2>
          <div className="average-rating">
            <h3>{averageRating.toFixed(1)}</h3>
            <div className="stars">
              {"★".repeat(Math.floor(averageRating))}{"☆".repeat(5 - Math.floor(averageRating))}
            </div>
            <p>Average Rating</p>
          </div>
          <div className="rating-breakdown">
            {Object.keys(ratingsBreakdown)
                .sort((a, b) => b - a) // Sort keys in descending order (5 to 1)
                .map((star) => (
                <div key={star} className="rating-row">
                    <span>{star} ★</span>
                    <div className="bar">
                    <div
                        style={{
                        width: `${(ratingsBreakdown[star] / reviews.length) * 100}%`,
                        }}
                    ></div>
                    </div>
                </div>
                ))}
          </div>
        </div>

        <div className="reviews">
          <h2>Reviews</h2>
          {reviews.map((review) => (
            <div key={review.id} className="review">
              <div className="stars">
                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
              </div>
              <p className="review-text">{review.text}</p>
              <p className="review-meta">
                <span className="review-author">{review.author}</span> |{" "}
                <span className="review-date">{review.date}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Add Review Button */}
      <div className="add-review">
        <button className="add-review-button" onClick={() => setIsModalOpen(true)}>
            <img src={require("../img/review.png")} alt="Review Icon" className="review-icon" />
            <span>Write a Review</span>
        </button>
      </div>

      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={isModalOpen} // Pass modal state
        onClose={() => setIsModalOpen(false)} // Function to close modal
      />
    </div>
  );
};

export default Dashboard;
