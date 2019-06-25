import validateData from '../lib/validateData';
import FlagService from '../services/FlagService';

const Flag = {
  async createFlag(req, res) {
    req.body.reportedBy = req.userId;
    const flagsReqs = ['carId', 'reason', 'reportedBy'];
    if (validateData(flagsReqs, req.body)) {
      return Flag.errorResponse(res, 400, 'Ensure to indicate the ad id and reason for the report');
    }
    const description = (req.body.description) ? req.body.description : 'none';
    const { carId } = req.body;
    const reason = req.body.reason.toLowerCase();
    let severity = 'minor';
    if (reason === 'fake' || reason === 'stolen' || reason === 'suspicious') {
      severity = 'extreme';
    }

    const { rows } = await FlagService.getReportByUser([carId, req.body.reportedBy]);
    if (rows.length > 0) {
      return Flag.errorResponse(res, 406, 'Your report on this ad is already recorded');
    }
    const result = await FlagService.getCarOwner(carId);
    if (result.rows.length < 1) {
      return Flag.errorResponse(res, 406, 'This ad is no longer available');
    }

    const values = [Date.now(), carId, reason, description, req.userId, severity];
    const newFlag = await FlagService.createNewFlag(values);
    return Flag.successResponse(res, 201, newFlag.rows[0]);
  },
  async updateFlag(req, res) {
    if (req.params.flagId.trim().length !== 13) {
      return Flag.errorResponse(res, 400, 'Invalid flag id');
    }
    const { rows } = await FlagService.updateFlag(req.params.flagId);
    return (rows.length < 1) ? Flag.errorResponse(res, 404, 'Flag already updated or not available')
      : Flag.successResponse(res, 200, rows[0]);
  },

  async deleteFlag(req, res) {
    if (req.params.flagId.trim().length !== 13) {
      return Flag.errorResponse(res, 400, 'Invalid flag id');
    }
    const { rows } = await FlagService.deleteFlag(req.params.flagId);
    return (rows.length < 1) ? Flag.errorResponse(res, 404, 'Flag not found')
      : Flag.successResponse(res, 200, rows[0]);
  },

  async getAllFlags(req, res) {
    const { rows } = await FlagService.getAllFlags();
    return (rows.length < 1) ? Flag.errorResponse(res, 200, 'There are no flags today')
      : Flag.successResponse(res, 200, rows);
  },

  errorResponse(res, statuscode, message) {
    return res.status(statuscode).send({
      status: statuscode,
      message,
    });
  },
  successResponse(res, statuscode, data) {
    return res.status(statuscode).send({
      status: statuscode,
      data,
    });
  },
};

export default Flag;
