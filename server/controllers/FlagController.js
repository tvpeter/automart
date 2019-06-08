import CarModel from '../models/CarModel';
import FlagModel from '../models/FlagModel';
import validateData from '../lib/validateData';

const Flag = {
  createFlag(req, res) {
    req.body.reportedBy = req.userId;
    const flagsReqs = ['carId', 'reason', 'reportedBy'];
    if (validateData(flagsReqs, req.body)) {
      return res.status(400).send({
        status: 400,
        message: 'Ensure to indicate the ad id and reason for the report',
      });
    }

    const cartoFlag = CarModel.carIsEligible(req.body.carId);
    if (!cartoFlag) {
      return res.status(404).send({
        status: 404,
        message: 'The ad is not longer active. Thank you.',
      });
    }
    if (req.body.reason.toLowerCase() === 'fake' || req.body.reason.toLowerCase() === 'stolen' || req.body.reason === 'suspicious') {
      req.body.severity = 'extreme';
    }
    // send the report
    const newFlag = FlagModel.createFlag(req.body);

    return res.status(200).send({
      status: 200,
      data: newFlag,
    });
  },
  updateFlag(req, res) {
    const flag = FlagModel.findSingleFlag(req.params.flagId);
    if (!flag) {
      return res.status(404).send({
        status: 404,
        message: 'Flag not found',
      });
    }
    const updatedFlag = FlagModel.updateFlagStatus(req.params.flagId);

    return res.status(200).send({
      status: 200,
      data: updatedFlag,
    });
  },

  deleteFlag(req, res) {
    const flag = FlagModel.findSingleFlag(req.params.flagId);
    if (!flag) {
      return res.status(404).send({
        status: 404,
        message: 'The flag is no longer available',
      });
    }
    return res.status(200).send({
      status: 200,
      message: 'Flag successfully deleted',
    });
  },
  getAllFlags(req, res) {
    const flags = FlagModel.getAllFlags();
    if (flags.length < 1) {
      return res.status(404).send({
        status: 404,
        message: 'There are no flags now.',
      });
    }
    return res.status(200).send({
      status: 200,
      data: flags,
    });
  },
};

export default Flag;
