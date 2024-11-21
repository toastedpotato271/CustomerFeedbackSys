import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import db from "../firebaseConfig";
import { loginWithGoogle, logout } from "../auth";
import AddReviewModal from "../components/AddReviewModal";
import "./Dashboard.css";
import logo from "../img/starplus-logo.png";
import bannerImage from "../img/banner-design.jpg";
import userIcon from "../img/user.png";
import predictionIcon from "../img/prediction.png";
import logisticModel from "../model/logistic_model.json";
import vectorizerData from "../model/vectorizer.json";
import { create, all } from "mathjs";

const Dashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [sortedAndFilteredReviews, setSortedAndFilteredReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [filterRating, setFilterRating] = useState("all");
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [averageRating, setAverageRating] = useState(0);
  const [ratingsBreakdown, setRatingsBreakdown] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const math = create(all);

  // Function to transform text using the vectorizer JSON
  const tfidfTransform = (text, vocabulary, idf) => {
    const tokens = text.toLowerCase().split(/\W+/); // Tokenize text
    const vector = new Array(Object.keys(vocabulary).length).fill(0);

    tokens.forEach((token) => {
      if (vocabulary[token] !== undefined) {
        vector[vocabulary[token]] = 1; // Mark presence of token
      }
    });

    // Apply idf weights
    return vector.map((val, index) => val * idf[index]);
  };

  // Function to predict sentiment using the model JSON
  const predictReview = (reviewText) => {
    const { coefficients, intercept, classes } = logisticModel;
    const { vocabulary, idf } = vectorizerData;

    // Transform the review using TF-IDF
    const transformedReview = tfidfTransform(reviewText, vocabulary, idf);

    // Perform logistic regression prediction
    const z = math.add(
      math.multiply(transformedReview, math.matrix(coefficients[0])),
      intercept[0]
    );
    const probability = 1 / (1 + Math.exp(-z));

    // Return class based on probability
    return probability >= 0.5 ? classes[1] : classes[0];
  };

  const handlePredictClick = (reviewText) => {
    const prediction = predictReview(reviewText);
    alert(
      `Prediction: This review is ${
        prediction === 1 ? "Good" : "Bad"
      }.\n\nReview: "${reviewText}"`
    );
  };

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

        // Apply default sort and filter
        applySortAndFilter(reviewsData, "latest", "all");
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const applySortAndFilter = (reviewsList, sortOrder, filterRating) => {
    let filteredReviews = reviewsList;

    // Apply filter
    if (filterRating !== "all") {
      filteredReviews = reviewsList.filter(
        (review) => review.rating === parseInt(filterRating)
      );
    }

    // Apply sort
    if (sortOrder === "latest") {
      filteredReviews.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortOrder === "oldest") {
      filteredReviews.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    setSortedAndFilteredReviews(filteredReviews);
  };

  const handleSortChange = (e) => {
    const selectedSortOrder = e.target.value;
    setSortOrder(selectedSortOrder);
    applySortAndFilter(reviews, selectedSortOrder, filterRating);
  };

  const handleFilterChange = (e) => {
    const selectedFilterRating = e.target.value;
    setFilterRating(selectedFilterRating);
    applySortAndFilter(reviews, sortOrder, selectedFilterRating);
  };

  const handleExpandReview = (reviewId) => {
    setExpandedReviews((prevExpanded) => {
      const updatedExpanded = new Set(prevExpanded);
      if (updatedExpanded.has(reviewId)) {
        updatedExpanded.delete(reviewId);
      } else {
        updatedExpanded.add(reviewId);
      }
      return updatedExpanded;
    });
  };

  const handleLogin = async () => {
    const loggedInUser = await loginWithGoogle();
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const getRandomColor = () => {
    const colors = ["#FF8A80", "#FF80AB", "#EA80FC", "#B388FF", "#8C9EFF"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src={logo} alt="StarPlus Logo" className="header-logo" />
        </div>
        {user ? (
          <button className="login-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="login-button" onClick={handleLogin}>
            <img
              src={require("../img/google-icon.png")}
              alt="Google Icon"
              className="google-icon"
            />
            <span>Login with Google</span>
          </button>
        )}
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
              {"★".repeat(Math.floor(averageRating))}{"☆".repeat(
                5 - Math.floor(averageRating)
              )}
            </div>
            <p>Average Rating</p>
          </div>
          <div className="rating-breakdown">
            {Object.keys(ratingsBreakdown)
              .sort((a, b) => b - a)
              .map((star) => (
                <div key={star} className="rating-row">
                  <span>{star} ★</span>
                  <div className="bar">
                    <div
                      style={{
                        width: `${
                          (ratingsBreakdown[star] / reviews.length) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="reviews">
          <h2>Reviews</h2>
          <div className="dropdowns">
            <div className="sort-dropdown">
              <label htmlFor="sort">Sort By: </label>
              <select id="sort" value={sortOrder} onChange={handleSortChange}>
                <option value="latest">Latest to Oldest</option>
                <option value="oldest">Oldest to Latest</option>
              </select>
            </div>
            <div className="filter-dropdown">
              <label htmlFor="filter">Filter By: </label>
              <select
                id="filter"
                value={filterRating}
                onChange={handleFilterChange}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {sortedAndFilteredReviews.map((review) => (
            <div key={review.id} className="review">
              <div className="review-header">
                <div className="stars">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </div>
                <span className="review-date">{review.date}</span>
              </div>

              <div className="review-text">
                {review.text.length > 100 ? (
                  expandedReviews.has(review.id) ? (
                    <>
                      {review.text}{" "}
                      <span
                        className="read-more"
                        onClick={() => handleExpandReview(review.id)}
                      >
                        Show Less
                      </span>
                    </>
                  ) : (
                    <>
                      {review.text.slice(0, 100)}...{" "}
                      <span
                        className="read-more"
                        onClick={() => handleExpandReview(review.id)}
                      >
                        Read More...
                      </span>
                    </>
                  )
                ) : (
                  review.text
                )}
              </div>

              <div className="review-meta">
                <div
                  className="author-icon"
                  style={{
                    backgroundColor: review.author
                      ? "transparent"
                      : getRandomColor(),
                  }}
                >
                  {review.author ? (
                    <img
                      src={review.authorPhoto || userIcon}
                      alt="User Icon"
                    />
                  ) : (
                    <img src={userIcon} alt="Anonymous Icon" />
                  )}
                </div>
                <span className="review-author">
                  {review.author || "Anonymous"}
                </span>
                <img
                  src={predictionIcon}
                  alt="AI Icon"
                  className="ai-icon"
                  onClick={() => handlePredictClick(review.text)} // Trigger prediction
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Add Review Button */}
      <div className="add-review">
        <button
          className="add-review-button"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={require("../img/review.png")}
            alt="Review Icon"
            className="review-icon"
          />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
