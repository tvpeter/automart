class Flag {
  constructor() {
    this.flags = [];
  }

  createFlag(data) {
    const newFlag = {
      id: Date.now(),
      carId: data.carId,
      createdOn: new Date().toLocaleString(),
      reason: data.reason || '',
      description: data.description || '',
      reportedBy: data.reportedBy || '',
      status: 'pending',
      severity: data.severity || 'minor',
    };
    this.flags.push(newFlag);
    return newFlag;
  }
}

export default new Flag();
