import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import db from "../firebaseConfig";
import "./AddReviewModal.css";
import confirmAnimation from "../img/confirm-animation.gif"; // Import the GIF

const AddReviewModal = ({ isOpen, onClose, user }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Track success state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "reviews"), {
        rating,
        text,
        author: user ? user.displayName : "Anonymous", // Use display name if logged in
        date: Timestamp.fromDate(new Date()).toDate().toLocaleDateString(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setRating(0);
        setText("");
        setIsSuccess(false);
        onClose();
      }, 2800); // Close modal after 2.8 seconds
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Failed to add review. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
          <div className="success-gif">
            <img src={confirmAnimation} alt="Success Animation" />
            <p className="success-message">Review successfully added!</p>
          </div>
        ) : (
          <>
            <h2>Add a Review</h2>
            <form onSubmit={handleSubmit}>
              <div className="rating-input">
                <p>Rating:</p>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= rating ? "filled" : ""}`}
                    onMouseEnter={() => setRating(star)}
                    onMouseLeave={() => setRating(rating)}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                placeholder="Write your review here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              ></textarea>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Submit
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddReviewModal;
