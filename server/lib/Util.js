class Util {
  constructor() {
    this.statusCode = null;
    this.data = null;
    this.message = null;
  }

  sendError(res, statusCode, message) {
    this.statusCode = statusCode;
    this.message = message;
    return res.status(this.statusCode).send({ status: this.statusCode, message: this.message });
  }

  sendSuccess(res, statusCode, data) {
    this.statusCode = statusCode;
    this.data = data;
    this.type = 'success';
    return res.status(statusCode).send({ status: this.statusCode, data: this.data });
  }
}

export default new Util();
