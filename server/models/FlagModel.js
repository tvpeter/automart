class Flag {
  constructor() {
    this.flags = [];
  }

  createFlag(data) {
    const newFlag = {
      id: Date.now(),
      carId: data.carId,
      created_on: new Date().toLocaleString(),
      reason: data.reason || '',
      description: data.description || '',
      reportedBy: data.reportedBy || '',
      status: 'pending',
      severity: data.severity || 'minor',
    };
    this.flags.push(newFlag);
    return newFlag;
  }

  /**
   * @description - return a single flag
   * @param {integer} flagId
   * @returns {object}
   */
  findSingleFlag(id) {
    return this.flags.find(flag => parseInt(flag.id, 10) === parseInt(id, 10));
  }

  updateFlagStatus(id) {
    const flag = this.findSingleFlag(id);
    flag.status = 'resolved';
    return flag;
  }

  deleteFlag(flag) {
    const flagIndex = this.flags.indexOf(flag);
    return this.flags.splice(flagIndex, 1);
  }
}

export default new Flag();
