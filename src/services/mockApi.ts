// Mock API for Add Shop form

export const fetchDistrictStateByPin = async (pinCode: string) => {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 500));
  // Dummy data based on pinCode
  if (pinCode === "110001") {
    return { district: "New Delhi", state: "Delhi" };
  }
  if (pinCode === "400001") {
    return { district: "Mumbai", state: "Maharashtra" };
  }
  // Default
  return { district: "Unknown District", state: "Unknown State" };
};

export const fetchShopTypeDetails = async (shopType: string) => {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 500));
  // Dummy data based on shopType
  if (shopType === "Grocery") {
    return { totalProducts: 120, isOwnAddedProduct: true };
  }
  if (shopType === "Electronics") {
    return { totalProducts: 80, isOwnAddedProduct: false };
  }
  // Default
  return { totalProducts: 0, isOwnAddedProduct: false };
}; 