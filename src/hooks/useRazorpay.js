import { useCallback } from "react";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const openCheckout = useCallback(async ({ key, orderId, razorpayOrderId, amount, customer, onSuccess, onFailure }) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Failed to load payment gateway");

    return new Promise((resolve, reject) => {
      const options = {
        key,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "herviva",
        description: "Wardrobe reimagined for every her",
        image: "/favicon.svg",
        order_id: razorpayOrderId,
        prefill: {
          name: customer.name,
          email: customer.email || "",
          contact: customer.phone,
        },
        theme: { color: "#6b2d3c" },
        handler: (response) => {
          onSuccess(response);
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            onFailure?.("Payment cancelled");
            reject(new Error("Payment cancelled"));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        onFailure?.(response.error.description);
        reject(new Error(response.error.description));
      });
      rzp.open();
    });
  }, []);

  return { openCheckout };
}
