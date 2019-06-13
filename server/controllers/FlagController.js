import CarModel from '../models/CarModel';
import FlagModel from '../models/FlagModel';
import validateData from '../lib/validateData';
import Car from './CarController';

const Flag = {
  createFlag(req, res) {
    req.body.reportedBy = req.userId;
    const flagsReqs = ['carId', 'reason', 'reportedBy'];
    if (validateData(flagsReqs, req.body)) {
      return Flag.errorResponse(res, 400, 'Ensure to indicate the ad id and reason for the report');
    }

    const cartoFlag = CarModel.carIsEligible(req.body.carId);
    if (!cartoFlag) {
      return Flag.errorResponse(res, 404, 'The ad is not longer active. Thank you.');
    }
    if (req.body.reason.toLowerCase() === 'fake' || req.body.reason.toLowerCase() === 'stolen' || req.body.reason === 'suspicious') {
      req.body.severity = 'extreme';
    }
    // send the report
    const newFlag = FlagModel.createFlag(req.body);
    return Flag.successResponse(res, 200, newFlag);
  },
  updateFlag(req, res) {
    const flag = FlagModel.findSingleFlag(req.params.flagId);
    if (!flag) {
      return Flag.errorResponse(res, 404, 'Flag not found');
    }
    const updatedFlag = FlagModel.updateFlagStatus(req.params.flagId);
    return Car.successResponse(res, 200, updatedFlag);
  },

  deleteFlag(req, res) {
    const flag = FlagModel.findSingleFlag(req.params.flagId);
    if (!flag) {
      return Flag.errorResponse(res, 404, 'The flag is no longer available');
    }
    return Flag.errorResponse(res, 200, 'Flag successfully deleted');
  },
  getAllFlags(req, res) {
    const flags = FlagModel.getAllFlags();
    return (flags.length < 1) ? Flag.errorResponse(res, 404, 'There are no flags now.')
      : Flag.successResponse(res, 200, flags);
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
