import Swal from "sweetalert2";

async function checkAndCreateOrder(order) {
  const STORAGE_KEY = "salesOrders";
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  const MAX_ORDERS = 20;
  const now = Date.now();

  let orders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  const normalize = (v) => (v ? String(v).trim() : "");

  const soldTo = normalize(order.soldTo);
  const shipTo = normalize(order.shipTo);
  const quantity = normalize(order.quantity);

  console.log("%c[DUP_CHECK] Incoming order:", "color:#0288d1;font-weight:bold;");
  console.log({ soldTo, shipTo, quantity });

  const recentOrders = orders.filter(
    (entry) => now - entry.timestamp < FIFTEEN_MINUTES
  );

  const duplicate = recentOrders.find(
    (entry) =>
      normalize(entry.soldTo) === soldTo &&
      normalize(entry.shipTo) === shipTo &&
      normalize(entry.quantity) === quantity
  );

  if (duplicate) {
    console.log("%c[DUPLICATE_DETECTED]", "color:red;font-weight:bold;");
    console.log(duplicate);

    const result = await Swal.fire({
      title: "Possible Duplicate Order",
      text: "A similar order was created in the last 15 minutes. Do you want to continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
      cancelButtonText: "Cancel"
    });

    console.log("%c[SWAL_RESULT] =>", "color:#6a1b9a;font-weight:bold;", result);

    // 👉 FIXED: use result.value instead of result.isConfirmed
    if (!result.value) {
      console.log("%c[USER_CANCELLED_DUPLICATE]", "color:#d50000;font-weight:bold;");
      return { proceed: false };
    }

    console.log("%c[USER_CONFIRMED_DUPLICATE]", "color:#00c853;font-weight:bold;");
    return { proceed: true, confirm: "Y" };
  }

  console.log("%c[NO_DUPLICATE] No previous entry within 15 min", "color:green;font-weight:bold;");

  orders.push({
    soldTo,
    shipTo,
    quantity,
    timestamp: now,
  });

  if (orders.length > MAX_ORDERS) {
    orders = orders.slice(-MAX_ORDERS);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

  return { proceed: true, confirm: "" };
}

export default checkAndCreateOrder;
