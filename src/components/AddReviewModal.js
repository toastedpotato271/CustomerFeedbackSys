import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import db from "../firebaseConfig";
import "./AddReviewModal.css";

const AddReviewModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Track success state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "reviews"), {
        rating,
        text,
        author: "Anonymous",
        date: Timestamp.fromDate(new Date()).toDate().toLocaleDateString(),
      });

      // Show success animation
      setIsSuccess(true);

      // Reset form and close modal after a short delay
      setTimeout(() => {
        setRating(0);
        setText("");
        setIsSuccess(false);
        onClose();
      }, 2000); // Close modal after 2 seconds
    } catch (error) {
      console.error("Error adding review: ", error);
      alert("Failed to add review. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
          <div className="success-animation">
            <div className="checkmark">
              <span className="line tip"></span>
              <span className="line long"></span>
              <div className="circle"></div>
              <div className="fix"></div>
            </div>
            <p>Review Submitted Successfully!</p>
          </div>
        ) : (
          <>
            <h2>Write a Review</h2>
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
