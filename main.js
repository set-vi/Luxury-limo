document.addEventListener("DOMContentLoaded", function () {
  // Declare variables
  const baseRate = 180; // Example standard rate
  const stJohnBaseRate = 500; // St. John rate
  const extraPassengerRate = 30; // Additional passenger rate
  const childSeatRate = 30; // Child seat rate
  const numPassengers = document.getElementById("number-of-passengers");
  const serviceType = document.getElementById("service-type");
  const roundTrip = document.getElementById("round-trip");
  const totalPriceText = document.getElementById("total-price");

  const breakdownBase = document.getElementById("breakdown-base");
  const breakdownExtraPassengers = document.getElementById("breakdown-extra-passengers");
  const breakdownChildSeat = document.getElementById("breakdown-child-seat");
  const breakdownServiceMultiplier = document.getElementById("breakdown-service-multiplier");
  const breakdownRoundTripMultiplier = document.getElementById("breakdown-round-trip-multiplier");
  const breakdownStJohn = document.getElementById("breakdown-stjohn");

  // Auto-fill booking date and time
  const bookingDate = document.getElementById("booking-date");
  const today = new Date().toISOString().split('T')[0];
  bookingDate.setAttribute("min", today);
  bookingDate.value = today;
  const bookingTime = document.getElementById("booking-time");
  let now = new Date();
  now.setMinutes(0,0,0);
  bookingTime.value = now.toTimeString().slice(0,5);

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navLinks = document.getElementById("nav-links");
  mobileToggle.addEventListener("click", function() {
    navLinks.classList.toggle("active");
  });

  // Price calculation logic
  function calculatePrice() {
    let totalPrice = baseRate;
    let passengers = parseInt(numPassengers.value) || 1;
    let extraCost = passengers > 4 ? (passengers - 4) * extraPassengerRate : 0;
    let childSeatCost = document.getElementById("child-seat").checked ? childSeatRate : 0;
    let serviceMultiplier = getServiceMultiplier(serviceType.value);
    let roundTripMultiplier = roundTrip.checked ? 2 : 1;

    // Check if St. John trip is selected
    const isStJohn = (pickup.value === "st-john" || dropoff.value === "st-john");
    if (isStJohn) {
      totalPrice = stJohnBaseRate + extraCost + childSeatCost;
    } else {
      totalPrice = (totalPrice + extraCost + childSeatCost) * serviceMultiplier * roundTripMultiplier;
    }

    // Update price breakdown UI
    updatePriceBreakdown(totalPrice, extraCost, childSeatCost, serviceMultiplier, roundTripMultiplier, isStJohn);
  }

  function getServiceMultiplier(serviceType) {
    if (serviceType === "hourly-rental") return 2;
    if (serviceType === "daily-rental") return 4;
    return 1;
  }

  function updatePriceBreakdown(totalPrice, extraCost, childSeatCost, serviceMultiplier, roundTripMultiplier, isStJohn) {
    breakdownBase.textContent = isStJohn ? stJohnBaseRate : baseRate;
    breakdownStJohn.textContent = isStJohn ? stJohnBaseRate : "0"; // Display St. John base if selected
    breakdownExtraPassengers.textContent = extraCost;
    breakdownChildSeat.textContent = childSeatCost;
    breakdownServiceMultiplier.textContent = serviceMultiplier;
    breakdownRoundTripMultiplier.textContent = roundTripMultiplier;
    totalPriceText.textContent = totalPrice.toFixed(2);
  }

  // Debounce price calculation
  function debounce(func, wait) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  }

  const calculateDebouncedPrice = debounce(calculatePrice, 500);
  numPassengers.addEventListener("input", calculateDebouncedPrice);

  // Real-time validation feedback
  const bookingForm = document.getElementById("booking-form");
  const inputs = bookingForm.querySelectorAll("input, select, textarea");
  inputs.forEach(input => {
    input.addEventListener("input", function() {
      if (!input.checkValidity()) {
        let errorSpan = input.nextElementSibling;
        if (!errorSpan || !errorSpan.classList.contains("error-message")) {
          errorSpan = document.createElement("span");
          errorSpan.className = "error-message";
          input.parentNode.insertBefore(errorSpan, input.nextSibling);
        }
        errorSpan.textContent = input.validationMessage;
      } else {
        let errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains("error-message")) {
          errorSpan.textContent = "";
        }
      }
    });
  });

  // Trigger confirmation modal on form submit
  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    showConfirmationModal();
  });

  function showConfirmationModal() {
    const modal = document.createElement("div");
    modal.className = "confirmation-modal";
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Confirm Your Booking</h3>
        <p><strong>Service Type:</strong> ${serviceType.value}</p>
        <p><strong>Passengers:</strong> ${numPassengers.value}</p>
        <p><strong>Total Price:</strong> $${totalPriceText.textContent}</p>
        <button id="confirm-btn">Confirm</button>
        <button id="cancel-btn">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("confirm-btn").addEventListener("click", function() {
      bookingForm.submit(); // Submit the form after confirmation
      modal.remove();
    });

    document.getElementById("cancel-btn").addEventListener("click", function() {
      modal.remove();
    });
  }
});
