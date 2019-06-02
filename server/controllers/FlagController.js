import CarModel from '../models/CarModel';
import FlagModel from '../models/FlagModel';

const Flag = {
  createFlag(req, res) {
    if (!req.body.carId || !req.body.reason) {
      return res.status(400).send({
        status: 400,
        message: 'Ensure to indicate the ad id and reason for the report',
      });
    }

    const car = CarModel.findSingle(req.body.carId);
    if (!car || car.status.toLowerCase() !== 'available') {
      return res.status(404).send({
        status: 404,
        message: 'The ad is not longer active. Thank you.',
      });
    }
    req.body.reportedBy = req.userId;
    // state the report severity level
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
};

export default Flag;
