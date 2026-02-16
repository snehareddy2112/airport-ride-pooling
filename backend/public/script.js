async function bookRide() {
  const resultDiv = document.getElementById("bookingResult");
  resultDiv.className = "result";
  resultDiv.innerHTML = "Processing...";

  try {
    const response = await fetch("/ride/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup_lat: 17.2403,
        pickup_lng: 78.4294,
        drop_lat: parseFloat(document.getElementById("drop_lat").value),
        drop_lng: parseFloat(document.getElementById("drop_lng").value),
        seats_required: parseInt(document.getElementById("seats").value),
        luggage_count: parseInt(document.getElementById("luggage").value),
        detour_tolerance_km: parseFloat(document.getElementById("detour").value),
        direction: document.getElementById("direction").value
      })
    });

    const data = await response.json();

    if (response.ok) {
      resultDiv.classList.add("success");
      resultDiv.innerHTML = `
        ✅ Ride Booked Successfully <br/>
        💰 Fare (for each person): ₹${data.fare} <br/>
        🧾 Ride ID: ${data.ride._id} <br/>
        🚗 Group ID: ${data.ride.ride_group_id}
      `;
    } else {
      resultDiv.classList.add("error");
      resultDiv.innerHTML = `❌ ${data.error || data.message}`;
    }

  } catch (err) {
    resultDiv.classList.add("error");
    resultDiv.innerHTML = `❌ ${err.message}`;
  }
}

async function cancelRide() {
  const resultDiv = document.getElementById("cancelResult");
  resultDiv.className = "result";
  resultDiv.innerHTML = "Processing...";

  try {
    const id = document.getElementById("cancelId").value;

    const response = await fetch(`/ride/cancel/${id}`, {
      method: "POST"
    });

    const data = await response.json();

    if (response.ok) {
      resultDiv.classList.add("success");
      resultDiv.innerHTML = "✅ Ride Cancelled Successfully";
    } else {
      resultDiv.classList.add("error");
      resultDiv.innerHTML = `❌ ${data.error || data.message}`;
    }

  } catch (err) {
    resultDiv.classList.add("error");
    resultDiv.innerHTML = `❌ ${err.message}`;
  }
}
function closeModal() {
  document.getElementById("demoModal").style.display = "none";
}

async function loadGroups() {
  const list = document.getElementById("groupsList");
  list.innerHTML = "Loading...";

  try {
    const response = await fetch("/ride/groups");
    const groups = await response.json();

    list.innerHTML = "";

    if (groups.length === 0) {
      list.innerHTML = "<li>No active groups</li>";
      return;
    }

    groups.forEach(group => {
      const li = document.createElement("li");
      li.textContent =
        `Group ID: ${group._id} | Seats Used: ${group.seats_used}`;
      list.appendChild(li);
    });

  } catch (err) {
    list.innerHTML = "<li>Error loading groups</li>";

  }

}
