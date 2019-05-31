class OrderModel {
  constructor() {
    this.orders = [];
  }

  /**
   * @description - create a new order
   * @param {Object} data
   * @returns {Object}
   */
  createOrder(data) {
    const newOrder = {
      id: Date.now(),
      buyerId: data.buyerId,
      carId: data.carId,
      sellerId: data.sellerId,
      price: data.price || 0,
      status: data.status || 'pending',
      date: new Date().toLocaleString(),
      priceOffered: data.priceOffered,
      deliveredDate: data.deliveredDate || new Date().toLocaleString(),
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  /**
   * @param {Number} orderId
   * @param {Number} newPrice
   * @returns {Object}
   */
  updateOrderPrice(orderId, newPrice) {
    const order = this.getSingleOrder(orderId);
    order.priceOffered = parseFloat(newPrice);
    return order;
  }

  /**
   * @param {Number} orderId
   * @returns {Object}
   */
  getSingleOrder(orderId) {
    return this.orders.find(order => parseInt(order.id, 10) === parseInt(orderId, 10));
  }
}
export default new OrderModel();
