import axios from 'axios';

const GHN_API_KEY = 'd123c170-4729-11f0-8342-3e24ae01a77c'; 

// Base URLs for GHN API
const GHN_BASE_URL = 'https://online-gateway.ghn.vn/shiip/public-api';
const GHN_MASTER_DATA_URL = `${GHN_BASE_URL}/master-data`;
const GHN_ORDER_URL = `${GHN_BASE_URL}/v2/shipping-order`;

// Default headers for all requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
  token: GHN_API_KEY,
});

/**
 * Get shipping fee calculation
 * @param {Object} params - Shipping parameters
 * @param {number} params.fromDistrictId - Source district ID
 * @param {number} params.toDistrictId - Destination district ID
 * @param {string} params.toWardCode - Destination ward code
 * @param {number} params.serviceTypeId - Service type (1: Express, 2: Standard)
 * @param {number} params.weight - Package weight in grams
 * @param {number} params.length - Package length in cm
 * @param {number} params.width - Package width in cm
 * @param {number} params.height - Package height in cm
 * @returns {Promise<Object|null>} Shipping fee data or null if error
 */
export const apiGetShippingFee = async ({
  fromDistrictId,
  toDistrictId,
  toWardCode,
  serviceTypeId = 2, // Default to standard service
  weight = 500,
  length = 20,
  width = 15,
  height = 10,
}) => {
  try {
    const response = await axios.post(
      `${GHN_ORDER_URL}/fee`,
      {
        from_district_id: fromDistrictId,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
        service_type_id: serviceTypeId,
        weight,
        length,
        width,
        height,
      },
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi tính phí vận chuyển:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Get all provinces
 * @returns {Promise<Array>} Array of provinces or empty array if error
 */
export const apiGetProvinces = async () => {
  try {
    const response = await axios.get(
      `${GHN_MASTER_DATA_URL}/province`,
      {
        headers: getHeaders(),
      }
    );
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Lỗi khi lấy tỉnh/thành:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Get all districts
 * @returns {Promise<Array>} Array of districts or empty array if error
 */
export const apiGetDistricts = async () => {
  try {
    const response = await axios.get(
      `${GHN_MASTER_DATA_URL}/district`,
      {
        headers: getHeaders(),
      }
    );
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Lỗi khi lấy quận/huyện:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Get districts by province ID
 * @param {number} provinceId - Province ID
 * @returns {Promise<Array>} Array of districts or empty array if error
 */
export const apiGetDistrictsByProvince = async (provinceId) => {
  try {
    const response = await axios.post(
      `${GHN_MASTER_DATA_URL}/district`,
      {
        province_id: provinceId,
      },
      {
        headers: getHeaders(),
      }
    );
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Lỗi khi lấy quận/huyện theo tỉnh:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Get wards by district ID
 * @param {number} districtId - District ID
 * @returns {Promise<Array>} Array of wards or empty array if error
 */
export const apiGetWardsByDistrict = async (districtId) => {
  try {
    const response = await axios.get(
      `${GHN_MASTER_DATA_URL}/ward`,
      {
        headers: getHeaders(),
        params: {
          district_id: districtId,
        },
      }
    );
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Lỗi khi lấy phường/xã:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Get available services for a route
 * @param {number} fromDistrictId - Source district ID
 * @param {number} toDistrictId - Destination district ID
 * @returns {Promise<Array>} Array of available services or empty array if error
 */
export const apiGetAvailableServices = async (fromDistrictId, toDistrictId) => {
  try {
    const response = await axios.post(
      `${GHN_BASE_URL}/v2/shipping-order/available-services`,
      {
        shop_id: parseInt(process.env.REACT_APP_GHN_SHOP_ID) || 0,
        from_district: fromDistrictId,
        to_district: toDistrictId,
      },
      {
        headers: getHeaders(),
      }
    );
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Lỗi khi lấy dịch vụ vận chuyển:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Create shipping order (excluded as requested)
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Order creation result
 */
export const apiCreateShippingOrder = async (orderData) => {
  try {
    const response = await axios.post(
      `${GHN_ORDER_URL}/create`,
      orderData,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi tạo đơn hàng:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get order list with search criteria
 * @param {Object} params - Search parameters
 * @param {string} params.fromDate - Start date (YYYY-MM-DD)
 * @param {string} params.toDate - End date (YYYY-MM-DD)
 * @param {Array} params.status - Array of status codes
 * @param {number} params.offset - Offset for pagination
 * @param {number} params.limit - Limit for pagination
 * @returns {Promise<Object>} Order list data or empty object if error
 */
export const apiGetOrderList = async ({
  fromDate,
  toDate,
  status = [],
  offset = 0,
  limit = 50,
}) => {
  try {
    const response = await axios.post(
      `${GHN_ORDER_URL}/search`,
      {
        from_date: fromDate,
        to_date: toDate,
        status,
        offset,
        limit,
      },
      {
        headers: getHeaders(),
      }
    );
    return response.data || {};
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách đơn hàng:', error.response?.data || error.message);
    return {};
  }
};

/**
 * Get order detail by order code
 * @param {string} orderCode - Order code
 * @returns {Promise<Object|null>} Order detail data or null if error
 */
export const apiGetOrderDetail = async (orderCode) => {
  try {
    const response = await axios.post(
      `${GHN_ORDER_URL}/detail`,
      {
        order_code: orderCode,
      },
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy chi tiết đơn hàng:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Cancel order by order codes
 * @param {Array<string>} orderCodes - Array of order codes to cancel
 * @returns {Promise<Object|null>} Cancel result or null if error
 */
export const apiCancelOrder = async (orderCodes) => {
  try {
    const response = await axios.post(
      `${GHN_ORDER_URL}/cancel`,
      {
        order_codes: orderCodes,
      },
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi hủy đơn hàng:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Get shipping order tracking information
 * @param {string} orderCode - Order code
 * @returns {Promise<Object|null>} Tracking data or null if error
 */
export const apiGetOrderTracking = async (orderCode) => {
  try {
    const response = await axios.post(
      `${GHN_BASE_URL}/v2/shipping-order/detail`,
      {
        order_code: orderCode,
      },
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin tracking:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Update order information
 * @param {string} orderCode - Order code
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Update result or null if error
 */
export const apiUpdateOrder = async (orderCode, updateData) => {
  try {
    const response = await axios.post(
      `${GHN_ORDER_URL}/update`,
      {
        order_code: orderCode,
        ...updateData,
      },
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật đơn hàng:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Calculate shipping time
 * @param {number} fromDistrictId - Source district ID
 * @param {number} toDistrictId - Destination district ID
 * @param {string} toWardCode - Destination ward code
 * @param {number} serviceId - Service ID
 * @returns {Promise<Object|null>} Shipping time data or null if error
 */
export const apiGetShippingTime = async (fromDistrictId, toDistrictId, toWardCode, serviceId) => {
  try {
    const response = await axios.post(
      `${GHN_BASE_URL}/v2/shipping-order/leadtime`,
      {
        from_district_id: fromDistrictId,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
        service_id: serviceId,
      },
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi tính thời gian vận chuyển:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Get shop information
 * @returns {Promise<Object|null>} Shop data or null if error
 */
export const apiGetShopInfo = async () => {
  try {
    const response = await axios.post(
      `${GHN_BASE_URL}/v2/shop/all`,
      {},
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin shop:', error.response?.data || error.message);
    return null;
  }
};

// Utility functions for data formatting
export const formatAddress = (province, district, ward, detailAddress) => {
  const addressParts = [detailAddress, ward?.WardName, district?.DistrictName, province?.ProvinceName];
  return addressParts.filter(part => part && part.trim()).join(', ');
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatWeight = (weightInGrams) => {
  if (weightInGrams >= 1000) {
    return `${(weightInGrams / 1000).toFixed(1)} kg`;
  }
  return `${weightInGrams} g`;
};

// Constants for service types
export const SERVICE_TYPES = {
  EXPRESS: 1,
  STANDARD: 2,
};

// Constants for order status
export const ORDER_STATUS = {
  READY_TO_PICK: 'ready_to_pick',
  PICKING: 'picking',
  CANCEL: 'cancel',
  MONEY_COLLECT_PICKING: 'money_collect_picking',
  PICKED: 'picked',
  STORING: 'storing',
  TRANSPORTING: 'transporting',
  SORTING: 'sorting',
  DELIVERING: 'delivering',
  MONEY_COLLECT_DELIVERING: 'money_collect_delivering',
  DELIVERED: 'delivered',
  DELIVERY_FAIL: 'delivery_fail',
  WAITING_TO_RETURN: 'waiting_to_return',
  RETURN: 'return',
  RETURN_TRANSPORTING: 'return_transporting',
  RETURN_SORTING: 'return_sorting',
  RETURNING: 'returning',
  RETURN_FAIL: 'return_fail',
  RETURNED: 'returned',
  EXCEPTION: 'exception',
  DAMAGE: 'damage',
  LOST: 'lost',
};

export default {
  apiGetShippingFee,
  apiGetProvinces,
  apiGetDistricts,
  apiGetDistrictsByProvince,
  apiGetWardsByDistrict,
  apiGetAvailableServices,
  apiCreateShippingOrder,
  apiGetOrderList,
  apiGetOrderDetail,
  apiCancelOrder,
  apiGetOrderTracking,
  apiUpdateOrder,
  apiGetShippingTime,
  apiGetShopInfo,
  formatAddress,
  formatCurrency,
  formatWeight,
  SERVICE_TYPES,
  ORDER_STATUS,
};