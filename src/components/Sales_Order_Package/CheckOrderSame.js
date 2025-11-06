import Swal from "sweetalert2";

async function checkAndCreateOrder(order) {
  const STORAGE_KEY = "salesOrders";
  const FIVE_MINUTES = 3 * 60 * 1000; // 3 minutes in milliseconds
  const MAX_ORDERS = 10;
  const now = Date.now();

  let orders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Remove entries older than 5 minutes (for duplicate check purposes only)
  const recentOrders = orders.filter(
    (entry) => now - entry.timestamp < FIVE_MINUTES
  );

  // Check for duplicate in recent orders
  const duplicate = recentOrders.find(
    (entry) =>
      entry.soldTo === order.soldTo &&
      entry.shipTo === order.shipTo &&
      entry.quantity === order.quantity
  );

  if (duplicate) {
    const result = await Swal.fire({
      title: "Possible Duplicate Order",
      text: "A similar order was placed in the last 3 minutes; please verify and proceed if correct.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, create it",
      cancelButtonText: "No, cancel",
    });

    if (!result.value) {
      return false; // User canceled
    }
  }

  // Add the new order
  orders.push({
    soldTo: order.soldTo,
    shipTo: order.shipTo,
    quantity: order.quantity,
    timestamp: now,
  });

  // Keep only the latest 20 orders (regardless of timestamp)
  if (orders.length > MAX_ORDERS) {
    orders = orders.slice(orders.length - MAX_ORDERS);
  }

  // Save back to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  return true; // Proceed with order creation
}

export default checkAndCreateOrder;
