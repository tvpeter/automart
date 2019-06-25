import validateData from '../lib/validateData';
import FlagService from '../services/FlagService';
import util from '../lib/Util';

const Flag = {
  async createFlag(req, res) {
    req.body.reportedBy = req.userId;
    const flagsReqs = ['carId', 'reason', 'reportedBy'];
    if (validateData(flagsReqs, req.body)) {
      return util.sendError(res, 400, 'Ensure to indicate the ad id and reason for the report');
    }
    const description = (req.body.description) ? req.body.description : 'none';
    const { carId } = req.body;
    const reason = req.body.reason.toLowerCase();
    let severity = 'minor';
    if (reason === 'fake' || reason === 'stolen' || reason === 'suspicious') {
      severity = 'extreme';
    }
    try {
      const { rows } = await FlagService.getReportByUser([carId, req.body.reportedBy]);
      if (rows.length > 0) {
        return util.sendError(res, 406, 'Your report on this ad is already recorded');
      }
      const result = await FlagService.getCarOwner(carId);
      if (result.rows.length < 1) {
        return util.sendError(res, 406, 'This ad is no longer available');
      }

      const values = [Date.now(), carId, reason, description, req.userId, severity];
      const newFlag = await FlagService.createNewFlag(values);
      return util.sendSuccess(res, 201, newFlag.rows[0]);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },
  async updateFlag(req, res) {
    if (req.params.flagId.trim().length !== 13) {
      return util.sendError(res, 400, 'Invalid flag id');
    }
    try {
      const { rows } = await FlagService.updateFlag(req.params.flagId);
      return (rows.length < 1) ? util.sendError(res, 404, 'Flag already updated or not available')
        : util.sendSuccess(res, 200, rows[0]);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },

  async deleteFlag(req, res) {
    if (req.params.flagId.trim().length !== 13) {
      return util.sendError(res, 400, 'Invalid flag id');
    }
    try {
      const { rows } = await FlagService.deleteFlag(req.params.flagId);
      return (rows.length < 1) ? util.sendError(res, 404, 'Flag not found')
        : util.sendSuccess(res, 200, rows[0]);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },

  async getAllFlags(req, res) {
    try {
      const { rows } = await FlagService.getAllFlags();
      return (rows.length < 1) ? util.sendError(res, 200, 'There are no flags today')
        : util.sendSuccess(res, 200, rows);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },
};

export default Flag;
