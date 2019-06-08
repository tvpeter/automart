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
    const order = this.getOrder(orderId);
    order.priceOffered = parseFloat(newPrice);
    return order;
  }

  /**
   * @param {Number} orderId
   * @returns {Object}
   */
  getOrder(orderId) {
    return this.orders.find(order => parseInt(order.id, 10) === parseInt(orderId, 10));
  }

  getSoldAdsByUser(userId) {
    return this.orders.filter(order => order.status === 'completed' && parseInt(order.sellerId, 10) === parseInt(userId, 10));
  }

  getAllOrders() {
    return this.orders;
  }

  updateOrderStatus(orderId, status) {
    const order = this.getOrder(orderId);
    order.status = status || order.status;
    return order;
  }

  deleteOrder(order) {
    const orderIndex = this.orders.indexOf(order);
    return this.orders.splice(orderIndex, 1);
  }
}
export default new OrderModel();
