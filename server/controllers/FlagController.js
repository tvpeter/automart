import validateData from '../lib/validateData';
import db from '../services/db';

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

    const query = `SELECT id FROM flags WHERE carid=${carId} AND reportedby=${req.body.reportedBy}`;
    const text = `SELECT owner FROM cars WHERE id=${carId} AND status='available'`;
    const createQuery = 'INSERT INTO flags(id, carid, reason, description, reportedby, severity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    try {
      const { rows } = await db.query(query);
      if (rows.length > 0) {
        return Flag.errorResponse(res, 406, 'Your report on this ad is already recorded');
      }
      const result = await db.query(text);
      if (result.rows.length < 1) {
        return Flag.errorResponse(res, 406, 'This ad is no longer available');
      }

      const values = [Date.now(), carId, reason, description, req.userId, severity];
      const newFlag = await db.query(createQuery, values);
      return Flag.successResponse(res, 201, newFlag.rows[0]);
    } catch (err) {
      return Flag.errorResponse(res, 500, err);
    }
  },
  async updateFlag(req, res) {
    if (req.params.flagId.trim().length !== 13) {
      return Flag.errorResponse(res, 400, 'Invalid flag id');
    }
    const text = `UPDATE flags SET status='resolved' WHERE id=${req.params.flagId} AND status='pending' RETURNING *`;

    try {
      const { rows } = await db.query(text);
      return (rows.length < 1) ? Flag.errorResponse(res, 404, 'Flag already updated or not available')
        : Flag.successResponse(res, 200, rows[0]);
    } catch (err) {
      return Flag.errorResponse(res, 500, err);
    }
  },

  async deleteFlag(req, res) {
    if (req.params.flagId.trim().length !== 13) {
      return Flag.errorResponse(res, 400, 'Invalid flag id');
    }
    const query = `DELETE FROM flags WHERE id=${req.params.flagId} RETURNING *`;
    try {
      const { rows } = await db.query(query);
      return (rows.length < 1) ? Flag.errorResponse(res, 404, 'Flag not found')
        : Flag.successResponse(res, 200, rows[0]);
    } catch (err) {
      return Flag.errorResponse(res, 500, err);
    }
  },

  async getAllFlags(req, res) {
    const query = 'SELECT * FROM flags GROUP BY status, id';
    try {
      const { rows } = await db.query(query);
      return (rows.length < 1) ? Flag.errorResponse(res, 200, 'There are no flags today')
        : Flag.successResponse(res, 200, rows);
    } catch (err) {
      return Flag.errorResponse(res, 500, err);
    }
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
